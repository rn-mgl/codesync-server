import { createConnection } from "@src/database/database";

import type {
  AdditionalSessionData,
  BaseSessionData,
  FullSessionData,
} from "@src/interface/session.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Session implements FullSessionData {
  title: string;
  code: string;
  host_id: string;
  language: string;
  max_participants: number;
  password: string | null;
  problem_id: string;
  type: "practice" | "interview" | "competition" | "learning";
  status: "waiting" | "active" | "completed" | "cancelled";
  started_at: string | null;
  ended_at: string | null;

  constructor(data: FullSessionData) {
    this.title = data.title;
    this.code = data.code;
    this.host_id = data.host_id;
    this.language = data.language;
    this.max_participants = data.max_participants;
    this.password = data.password;
    this.problem_id = data.problem_id;
    this.type = data.type;
    this.status = data.status;
    this.started_at = data.started_at;
    this.ended_at = data.ended_at;
  }

  static async create(data: BaseSessionData & Partial<AdditionalSessionData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO sessions (${columns}) VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM sessions;`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM sessions WHERE id = ?;`;

      const values = [id];

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

      const query = `SELECT * FROM sessions WHERE code = ?;`;

      const values = [code];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByStatus(status: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM sessions WHERE status = ?;`;

      const values = [status];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseSessionData & AdditionalSessionData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE sessions SET ${update} WHERE id = ?;`;

      const [result, fields] = await db.execute(query, [...values, id]);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Session;
