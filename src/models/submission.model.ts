import { createConnection } from "@src/database/database";
import type {
  BaseSubmissionData,
  SubmissionPayload,
  SubmissionStatus,
  SupportedLanguages,
} from "@src/interface/submission.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Submission implements BaseSubmissionData {
  id: number;
  code: string;
  error_message: string | null;
  execution_time_ms: number;
  language: SupportedLanguages;
  memory_used_mb: number;
  problem_id: number;
  status: SubmissionStatus;
  test_results: string | null;
  user_id: number;
  deleted_at: string | null;

  constructor(data: BaseSubmissionData) {
    this.id = data.id;
    this.code = data.code;
    this.error_message = data.error_message;
    this.execution_time_ms = data.execution_time_ms;
    this.language = data.language;
    this.memory_used_mb = data.memory_used_mb;
    this.problem_id = data.problem_id;
    this.status = data.status;
    this.test_results = data.test_results;
    this.user_id = data.user_id;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: SubmissionPayload) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO submissions (${columns}) VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all(options?: Partial<BaseSubmissionData>) {
    try {
      const db = createConnection();

      const conditions = [`deleted_at IS NULL`];
      const values: unknown[] = [];

      if (options) {
        const VALID_OPTIONS: (keyof typeof options)[] = [
          "id",
          "user_id",
          "problem_id",
          "code",
          "language",
          "status",
          "execution_time_ms",
          "memory_used_mb",
          "test_results",
          "error_message",
        ];

        for (const option of VALID_OPTIONS) {
          const value = options[option as keyof typeof options];
          if (value !== undefined) {
            conditions.push(`${option} = ?`);
            values.push(value);
          }
        }
      }

      const mappedConditions = conditions.join(" AND ");

      const query = `SELECT * FROM submissions WHERE ${mappedConditions};`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM submissions WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

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

      const query = `SELECT * FROM submissions WHERE user_id = ? AND deleted_at IS NULL;`;

      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByProblem(problemId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM submissions WHERE problem_id = ? AND deleted_at IS NULL;`;

      const values = [problemId];

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

      const query = `SELECT * FROM submissions WHERE status = ? AND deleted_at IS NULL;`;

      const values = [status];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Submission;
