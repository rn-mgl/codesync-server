import { createConnection } from "@src/database/database";
import type {
  BaseTestCaseData,
  SoftDeleteTestCasePayload,
  TestCasePayload,
} from "@src/interface/test-case.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class TestCase implements BaseTestCaseData {
  id: number;
  expected_output: string;
  input: Record<string, unknown> | string;
  memory_limit_mb: number;
  order_index: number;
  problem_id: number;
  time_limit_ms: number;
  deleted_at: string | null;
  is_sample: boolean;
  is_hidden: boolean;

  constructor(data: BaseTestCaseData) {
    this.id = data.id;
    this.problem_id = data.problem_id;
    this.expected_output = data.expected_output;
    this.input = data.input;
    this.memory_limit_mb = data.memory_limit_mb;
    this.time_limit_ms = data.time_limit_ms;
    this.order_index = data.order_index;
    this.deleted_at = data.deleted_at;
    this.is_hidden = data.is_hidden;
    this.is_sample = data.is_sample;
  }

  static async create(data: TestCasePayload) {
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
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async all(
    type?: Partial<Pick<BaseTestCaseData, "is_hidden" | "is_sample">>,
  ) {
    try {
      const db = createConnection();

      const conditions = [`tc.deleted_at IS NULL`, `p.deleted_at IS NULL`];

      const values = [];

      if (type) {
        const VALID_TYPES: (keyof typeof type)[] = ["is_hidden", "is_sample"];

        for (const option of VALID_TYPES) {
          const value = type[option as keyof typeof type];

          if (typeof value === "boolean") {
            conditions.push(`tc.${option} = ?`);
            values.push(value);
          }
        }
      }

      const mappedConditions = conditions.join(" AND ");

      const query = `SELECT tc.*, 
                      p.id AS problem_id, p.title, p.slug FROM test_cases AS tc
                      INNER JOIN problems AS p ON tc.problem_id = p.id
                     WHERE ${mappedConditions};`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT tc.*, 
                      p.id AS problem_id, p.title, p.slug FROM test_cases AS tc
                      INNER JOIN problems AS p ON tc.problem_id = p.id
                     WHERE tc.deleted_at IS NULL AND p.deleted_at IS NULL AND tc.id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findByProblem(
    problemId: number,
    type?: Partial<Pick<BaseTestCaseData, "is_sample" | "is_hidden">>,
  ) {
    try {
      const db = createConnection();

      const conditions = [
        "tc.deleted_at IS NULL",
        "p.deleted_at IS NULL",
        "p.id = ?",
      ];

      const values: (string | number | boolean)[] = [problemId];

      if (type) {
        const VALID_TYPES: (keyof typeof type)[] = ["is_sample", "is_hidden"];

        for (const option of VALID_TYPES) {
          const value = type[option as keyof typeof type];

          if (typeof value === "boolean") {
            conditions.push(`tc.${option} = ?`);
            values.push(value);
          }
        }
      }

      const mappedConditions = conditions.join(" AND ");

      const query = `SELECT tc.*, 
                      p.id AS problem_id, p.title, p.slug FROM test_cases AS tc
                      INNER JOIN problems AS p ON tc.problem_id = p.id
                     WHERE ${mappedConditions};`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async update(id: number, updates: Partial<TestCasePayload>) {
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
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async destroy(id: number, data: SoftDeleteTestCasePayload) {
    try {
      const db = createConnection();

      const update = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);

      const query = `UPDATE test_cases SET ${update} WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, [
        ...values,
        id,
      ]);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }
}

export default TestCase;
