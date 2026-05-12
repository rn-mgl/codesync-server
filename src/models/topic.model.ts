import { createConnection } from "@src/database/database";
import type {
  BaseTopicData,
  SoftDeleteTopicPayload,
  TopicPayload,
} from "@src/interface/topic.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Topic implements BaseTopicData {
  id: number;
  name: string;
  description: string;
  slug: string;
  icon: string;
  deleted_at: string | null;

  constructor(data: BaseTopicData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.slug = data.slug;
    this.icon = data.icon;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: TopicPayload) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((key) => `${key}`)
        .join(`, `);
      const values = Object.values(data).map((value) => `${value}`);
      const preparedValues = values.map(() => `?`).join(`, `);

      const query = `INSERT INTO topics (${columns}) VALUES (${preparedValues});`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM topics WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findByIds(ids: number[]) {
    try {
      if (!ids.length) {
        throw new Error(`Invalid data.`);
      }

      const db = createConnection();

      const preparedValues = ids.map(() => "?").join(", ");

      const query = `SELECT * FROM topics WHERE id IN (${preparedValues}) AND deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query, ids);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findBySlug(slug: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM topics WHERE slug = ? AND deleted_at IS NULL;`;

      const values = [slug];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findBySlugs(slugs: string[]) {
    try {
      if (!slugs.length) {
        throw new Error(`Invalid data.`);
      }

      const db = createConnection();

      const preparedValues = slugs.map(() => "?").join(", ");

      const query = `SELECT * FROM topics WHERE slug IN (${preparedValues}) AND deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query, slugs);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findByProblem(problemId: number) {
    try {
      const db = createConnection();

      const query = `SELECT t.* 
                    FROM topics t
                    INNER JOIN problem_topics pt ON
                    pt.topic_id = t.id
                    WHERE 
                      pt.problem_id = ? AND 
                      pt.deleted_at IS NULL AND 
                      t.deleted_at IS NULL;`;

      const values = [problemId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM topics WHERE deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async update(id: number, updates: Partial<TopicPayload>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");

      const values = Object.values(updates);

      const query = `UPDATE topics SET ${update} WHERE id = ?;`;
      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async destroy(id: number, data: SoftDeleteTopicPayload) {
    try {
      const db = createConnection();

      const update = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);

      const query = `UPDATE topics SET ${update} WHERE id = ?;`;
      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }
}

export default Topic;
