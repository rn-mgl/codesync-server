import { createConnection } from "@src/database/database";
import type {
  AdditionalSessionParticipantData,
  BaseSessionParticipantData,
  FullSessionParticipantData,
} from "@src/interface/session.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class SessionParticipant implements FullSessionParticipantData {
  id: number;
  is_active: boolean;
  joined_at: string;
  left_at: string | null;
  lines_added: number;
  lines_deleted: number;
  role: "host" | "collaborator" | "observer";
  session_id: number;
  user_id: number;
  deleted_at: string | null;

  constructor(data: FullSessionParticipantData) {
    this.is_active = data.is_active;
    this.joined_at = data.joined_at;
    this.left_at = data.left_at;
    this.lines_added = data.lines_added;
    this.lines_deleted = data.lines_deleted;
    this.role = data.role;
    this.session_id = data.session_id;
    this.user_id = data.user_id;
    this.id = data.id;
    this.deleted_at = data.deleted_at;
  }

  static async create(
    data: BaseSessionParticipantData &
      Partial<AdditionalSessionParticipantData>,
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO sessions_participants (${columns}) VALUES (${preparedValues});`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM sessions_participants WHERE deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM session_participants WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findBySession(sessionId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM session_participants WHERE session_id = ? AND deleted_at IS NULL;`;

      const values = [sessionId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async update(
    id: number,
    updates: Partial<
      BaseSessionParticipantData & AdditionalSessionParticipantData
    >,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE session_participants SET ${update} WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader[]>(query, [
        ...values,
        id,
      ]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default SessionParticipant;
