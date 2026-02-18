import { createConnection } from "@src/database/database";
import type {
  AdditionalTopicData,
  BaseTopicData,
  FullTopicData,
} from "@src/interface/topic.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Topic implements FullTopicData {
  name: string;
  description: string;
  slug: string;
  icon: string;

  constructor(data: FullTopicData) {
    this.name = data.name;
    this.description = data.description;
    this.slug = data.slug;
    this.icon = data.icon;
  }

  static async create(data: BaseTopicData & Partial<AdditionalTopicData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((key) => `${key}`)
        .join(`, `);
      const values = Object.values(data).map((value) => `${value}`);
      const preparedValues = values.map((value) => `?`).join(`, `);

      const query = `INSERT INTO topics (${columns}) VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM topics WHERE id = ?;`;

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

      const query = `SELECT * FROM topics WHERE slug = ?;`;

      const values = [slug];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM topics;`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseTopicData & AdditionalTopicData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");

      const values = Object.values(updates);

      const query = `UPDATE topics SET ${update} WHERE id = ?;`;
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

export default Topic;
