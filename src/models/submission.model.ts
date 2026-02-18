import { createConnection } from "@src/database/database";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
  FullSubmissionData,
} from "@src/interface/submission.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Submission implements FullSubmissionData {
  code: string;
  error_message: string;
  execution_time_ms: number;
  language: string;
  memory_used_kb: number;
  problem_id: number;
  status: string;
  test_results: string;
  user_id: number;

  constructor(data: FullSubmissionData) {
    this.code = data.code;
    this.error_message = data.error_message;
    this.execution_time_ms = data.execution_time_ms;
    this.language = data.language;
    this.memory_used_kb = data.memory_used_kb;
    this.problem_id = data.problem_id;
    this.status = data.status;
    this.test_results = data.test_results;
    this.user_id = data.user_id;
  }

  static async create(
    data: BaseSubmissionData & Partial<AdditionalSubmissionData>,
  ) {
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

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM submissions;`;

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

      const query = `SELECT * FROM submissions WHERE id = ?;`;

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

      const query = `SELECT * FROM submissions WHERE user_id = ?;`;

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

      const query = `SELECT * FROM submissions WHERE problem_id = ?;`;

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

      const query = `SELECT * FROM submissions WHERE status = ?;`;

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
