import { createConnection } from "@src/database/database";
import type {
  AchievementPayload,
  BaseAchievementData,
  UnlockCriteria,
} from "@src/interface/achievement.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Achievement implements BaseAchievementData {
  id: number;
  badge_color: "diamond" | "gold" | "silver" | "bronze";
  category: "problems" | "streak" | "social" | "skill" | "special";
  description: string;
  icon: string;
  name: string;
  points: number;
  slug: string;
  unlock_criteria: UnlockCriteria;

  constructor(data: BaseAchievementData) {
    this.id = data.id;
    this.badge_color = data.badge_color;
    this.category = data.category;
    this.description = data.description;
    this.icon = data.icon;
    this.name = data.name;
    this.points = data.points;
    this.slug = data.slug;
    this.unlock_criteria = data.unlock_criteria;
  }

  static async create(data: AchievementPayload) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO achievements (${columns}) VALUES (${preparedValues});`;
      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async all(options?: Partial<BaseAchievementData>) {
    try {
      const db = createConnection();

      const conditions = [];
      const values = [];

      const VALID_FIELDS: (keyof BaseAchievementData)[] = [
        "badge_color",
        "category",
      ];

      if (options) {
        for (const field of VALID_FIELDS) {
          const value = options[field];

          if (value !== undefined) {
            conditions.push(`${field} = ?`);
            values.push(value);
          }
        }
      }

      const mappedConditions = conditions.join(" AND ");

      let query = `SELECT * FROM achievements`;

      if (conditions.length) {
        query += ` WHERE ${mappedConditions}`;
      }

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM achievements WHERE id = ?;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findBySlug(slug: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM achievements WHERE slug = ?;`;

      const values = [slug];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async update(id: number, updates: Partial<AchievementPayload>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE achievements SET ${update} WHERE id = ?;`;
      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async destroy(id: number) {
    try {
      const db = createConnection();

      const query = `DELETE FROM achievements WHERE id = ?;`;
      const result = await db.execute<ResultSetHeader>(query, [id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default Achievement;
