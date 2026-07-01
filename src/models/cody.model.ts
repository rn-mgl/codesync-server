import { createConnection } from "@src/database/database";
import type { BaseCodyData, CodyPayload } from "@src/interface/cody.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Cody implements BaseCodyData {
  id: number;
  name: string;
  user_id: number;
  previous_interaction: string | null;
  input: string;
  output: string;
  interaction: string;
  created_at: string;
  updated_at: string;

  constructor(data: BaseCodyData) {
    this.id = data.id;
    this.name = data.name;
    this.user_id = data.user_id;
    this.created_at = data.created_at;
    this.previous_interaction = data.previous_interaction;
    this.interaction = data.interaction;
    this.input = data.input;
    this.output = data.output;
    this.updated_at = data.updated_at;
  }

  static async create(data: CodyPayload) {
    try {
      const db = createConnection();

      const columns = Object.keys(data).join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO cody (${columns}) VALUES (${preparedValues});`;
      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);

      throw new Error("An error occurred during the operation.");
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();
      const values = [id];

      const query = `SELECT * FROM cody WHERE id = ?;`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);

      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByUser(userId: number, options?: { parentOnly: boolean }) {
    try {
      const db = createConnection();
      const values = [userId];

      const conditions = [];

      if (options?.parentOnly) {
        conditions.push("previous_interaction IS NULL");
      }

      const mappedConditions = conditions.join(" AND ");

      const query = `SELECT * FROM cody WHERE user_id = ? AND ${mappedConditions};`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);

      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByInteraction(interaction: string) {
    try {
      const db = createConnection();
      const values = [interaction];

      const query = `SELECT * FROM cody WHERE interaction = ?;`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);

      throw new Error("An error occurred during the operation.");
    }
  }

  static async update(id: number, data: Partial<CodyPayload>) {
    try {
      const db = createConnection();

      const updates = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);

      const query = `UPDATE cody SET ${updates} WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);

      throw new Error("An error occurred during the operation.");
    }
  }
}

export default Cody;
