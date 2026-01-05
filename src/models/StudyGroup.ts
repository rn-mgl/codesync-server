import { createConnection } from "@src/database/database";
import type {
  AdditionalStudyGroupData,
  BaseStudyGroupData,
  FullStudyGroupData,
} from "@src/interface/studyGroupInterface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class StudyGroup implements FullStudyGroupData {
  description: string;
  invite_code: string;
  is_public: boolean;
  name: string;
  owner_id: number;

  constructor(data: FullStudyGroupData) {
    this.description = data.description;
    this.invite_code = data.invite_code;
    this.is_public = data.is_public;
    this.name = data.name;
    this.owner_id = data.owner_id;
  }

  static async create(
    data: BaseStudyGroupData & Partial<AdditionalStudyGroupData>
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO study_groups (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM study_groups WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByOwner(ownerId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_groups WHERE owner_id = ?;`;

      const values = [ownerId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByCode(code: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM study_groups WHERE code = ?;`;

      const values = [code];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullStudyGroupData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE study_groups SET ${columns} WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, [
        ...values,
        id,
      ]);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default StudyGroup;
