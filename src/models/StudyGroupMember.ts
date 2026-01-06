import { createConnection } from "@src/database/database";
import type {
  BaseStudyGroupMemberData,
  FullStudyGroupMemberData,
} from "@src/interface/studyGroupInterface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class StudyGroupMember implements FullStudyGroupMemberData {
  group_id: number;
  joined_at: string;
  role: "owner" | "moderator" | "member";
  user_id: number;

  constructor(data: FullStudyGroupMemberData) {
    this.group_id = data.group_id;
    this.joined_at = data.joined_at;
    this.role = data.role;
    this.user_id = data.user_id;
  }

  static async create(data: BaseStudyGroupMemberData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO study_group_members (${columns}) VALUES (${preparedValues});`;
      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_group_members WHERE id = ?;`;
      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByGroup(groupId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_group_members WHERE group_id = ?;`;
      const values = [groupId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByUser(userId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_group_members WHERE user_id = ?;`;
      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByRole(role: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_group_members WHERE role = ?;`;
      const values = [role];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullStudyGroupMemberData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} => ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE study_group_members SET ${update} WHERE id = ?;`;

      const [result, fields] = await db.execute(query, [...values, id]);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default StudyGroupMember;
