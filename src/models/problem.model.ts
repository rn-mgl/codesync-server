import { createConnection } from "@src/database/database";
import type {
  AdditionalProblemData,
  BaseProblemData,
  FullProblemData,
} from "@src/interface/problem.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Problem implements FullProblemData {
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  input_format: string;
  output_format: string;
  constraints: string;
  editorial: string;
  acceptance_rate: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;

  constructor(data: FullProblemData) {
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.input_format = data.input_format;
    this.output_format = data.output_format;
    this.constraints = data.constraints;
    this.editorial = data.editorial;
    this.acceptance_rate = data.acceptance_rate;
    this.total_submissions = data.total_submissions;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data: BaseProblemData & Partial<AdditionalProblemData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((key) => `${key}`)
        .join(", ");

      const values = Object.values(data);

      const preparedValues = values.map((value) => `?`).join(", ");

      const query = `INSERT INTO problems (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT id, title, slug, difficulty, acceptance_rate FROM problems;`;

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

      const query = `SELECT * FROM problems WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findBySlug(slug: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM problems WHERE slug = ?;`;

      const values = [slug];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseProblemData & AdditionalProblemData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = Object.values(update);

      const query = `UPDATE problems SET ${update} WHERE id = ?;`;

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

export default Problem;
