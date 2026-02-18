import { createConnection } from "@src/database/database";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
  FullTestCaseData,
} from "@src/interface/test-case.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class TestCase implements FullTestCaseData {
  expected_output: string;
  input: string;
  memory_limit_mb: number;
  order_index: number;
  problem_id: number;
  time_limit_ms: number;

  constructor(data: FullTestCaseData) {
    this.problem_id = data.problem_id;
    this.expected_output = data.expected_output;
    this.input = data.input;
    this.memory_limit_mb = data.memory_limit_mb;
    this.time_limit_ms = data.time_limit_ms;
    this.order_index = data.order_index;
  }

  static async create(
    data: BaseTestCaseData & Partial<AdditionalTestCaseData>,
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => `${column}`)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => `?`).join(", ");

      const query = `INSERT INTO test_cases (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM test_cases;`;

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

      const query = `SELECT * FROM test_cases WHERE id = ?;`;

      const values = [id];

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

      const query = `SELECT * FROM test_cases WHERE problem_id = ?;`;

      const values = [problemId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseTestCaseData & AdditionalTestCaseData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE test_cases SET ${update} WHERE id = ?;`;

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

export default TestCase;
