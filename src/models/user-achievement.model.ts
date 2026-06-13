import { createConnection } from "@src/database/database";
import type {
  BaseUserAchievementData,
  UserAchievementPayload,
} from "@src/interface/user.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class UserAchievement implements BaseUserAchievementData {
  id: number;
  achievement_id: number;
  earned_at: string;
  user_id: number;

  constructor(data: BaseUserAchievementData) {
    this.id = data.id;
    this.achievement_id = data.achievement_id;
    this.earned_at = data.earned_at;
    this.user_id = data.user_id;
  }

  static async create(data: UserAchievementPayload) {
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

      const query = `SELECT * FROM user_achievements WHERE id = ?;`;

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

      const query = `SELECT * FROM user_achievements WHERE user_id = ?;`;

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

      const query = `SELECT * FROM user_achievements WHERE achievement_id = ?;`;

      const values = [achievementId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByBridge(userId: number, achievementId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?;`;

      const values = [userId, achievementId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default UserAchievement;
