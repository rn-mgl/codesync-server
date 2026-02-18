import { createConnection } from "@src/database/database";
import type {
  BaseAchievementData,
  FullAchievementData,
} from "@src/interface/achievement.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Achievement implements FullAchievementData {
  badge_color: "diamond" | "gold" | "silver" | "bronze";
  category: "problems" | "streak" | "social" | "skill" | "special";
  description: string;
  icon: string;
  name: string;
  points: number;
  slug: string;
  unlock_criteria: string;
  deleted_at: string;

  constructor(data: FullAchievementData) {
    this.badge_color = data.badge_color;
    this.category = data.category;
    this.description = data.description;
    this.icon = data.icon;
    this.name = data.name;
    this.points = data.points;
    this.slug = data.slug;
    this.unlock_criteria = data.unlock_criteria;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: BaseAchievementData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO achievements (${columns}) VALUES (${preparedValues});`;
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

      const query = `SELECT * FROM achievements WHERE id = ?;`;

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

      const query = `SELECT * FROM achievements WHERE slug = ?;`;

      const values = [slug];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullAchievementData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE achievements SET ${update} WHERE id = ?;`;
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

export default Achievement;
