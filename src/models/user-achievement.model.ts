import { createConnection } from "@src/database/database";
import type {
  BaseUserAchievementData,
  FullUserAchievementData,
} from "@src/interface/user.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class UserAchievement implements FullUserAchievementData {
  id: number;
  achievement_id: number;
  earned_at: string;
  user_id: number;
  deleted_at: string | null;

  constructor(data: FullUserAchievementData) {
    this.id = data.id;
    this.achievement_id = data.achievement_id;
    this.earned_at = data.earned_at;
    this.user_id = data.user_id;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: BaseUserAchievementData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO user_achievements (${columns}) VALUES (${preparedValues});`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByUser(userId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE user_id = ? AND deleted_at IS NULL;`;

      const values = [userId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByAchievement(achievementId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE achievement_id = ? AND deleted_at IS NULL;`;

      const values = [achievementId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async delete(id: number) {
    try {
      const db = createConnection();

      const values = Object.values(id);

      const query = `DELETE user_achievements WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default UserAchievement;
