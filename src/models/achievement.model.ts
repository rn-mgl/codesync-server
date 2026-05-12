import { createConnection } from "@src/database/database";
import type {
  AchievementPayload,
  BaseAchievementData,
  SoftDeleteAchievementPayload,
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
  deleted_at: string | null;

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
    this.deleted_at = data.deleted_at;
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

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT id, name, slug, description, icon, badge_color, category, points FROM achievements WHERE deleted_at IS NULL;`;

      const result = await db.execute<RowDataPacket[]>(query);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM achievements WHERE id = ? AND deleted_at IS NULL;`;

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

      const query = `SELECT * FROM achievements WHERE slug = ? AND deleted_at IS NULL;`;

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

  static async destroy(id: number, data: SoftDeleteAchievementPayload) {
    try {
      const db = createConnection();

      const update = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);

      const query = `UPDATE achievements SET ${update} WHERE id = ?;`;
      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default Achievement;
