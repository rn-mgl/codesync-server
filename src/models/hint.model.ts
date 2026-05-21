import { createConnection } from "@src/database/database";
import type {
  BaseHintData,
  FullHintData,
  HintPayload,
} from "@src/interface/hint.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Hint implements BaseHintData {
  level: number;
  hint: string;
  problem_id: number;
  order_index: number;
  deleted_at: string | null;
  id: number;
  created_at: string;
  updated_at: string;

  constructor(data: FullHintData) {
    this.level = data.level;
    this.hint = data.hint;
    this.problem_id = data.problem_id;
    this.order_index = data.order_index;
    this.deleted_at = data.deleted_at;
    this.id = data.id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data: HintPayload) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => `?`).join(", ");

      const query = `INSERT INTO hints (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM hints WHERE deleted_at IS NULL;`;

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

      const query = `SELECT h.*, p.slug FROM hints h
                      INNER JOIN problems p
                      ON p.id = h.problem_id
                      WHERE h.id = ? AND h.deleted_at IS NULL
                      AND p.deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByProblem(problemId: number) {
    try {
      const db = createConnection();

      const query = `SELECT h.*, p.slug FROM hints h
                      INNER JOIN problems p
                      ON p.id = h.problem_id
                      WHERE h.problem_id = ? AND h.deleted_at IS NULL
                      AND p.deleted_at IS NULL;`;

      const values = [problemId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async update(id: number, updates: Partial<HintPayload>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE hints SET ${update} WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default Hint;
