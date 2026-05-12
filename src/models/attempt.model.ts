import { createConnection } from "@src/database/database";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
  FullAttemptData,
} from "@src/interface/attempt.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Attempt implements FullAttemptData {
  attempt_count: number;
  hints_used: number;
  is_solved: boolean;
  problem_id: number;
  time_spent_seconds: number;
  user_id: number;
  deleted_at: string | null;

  constructor(data: FullAttemptData) {
    this.attempt_count = data.attempt_count;
    this.hints_used = data.hints_used;
    this.is_solved = data.is_solved;
    this.problem_id = data.problem_id;
    this.time_spent_seconds = data.time_spent_seconds;
    this.user_id = data.user_id;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: BaseAttemptData & Partial<AdditionalAttemptData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO attempts (${columns}) VALUES (${preparedValues});`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM attempts WHERE deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query);

      return result[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM attempts WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByUser(userId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM attempts WHERE user_id = ? AND deleted_at IS NULL;`;

      const values = [userId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByProblem(problemId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM attempts WHERE problem_id = ? AND deleted_at IS NULL;`;

      const values = [problemId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Attempt;
