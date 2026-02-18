import { createConnection } from "@src/database/database";
import type {
  BaseUserAchievementData,
  FullUserAchievementData,
} from "@src/interface/user.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class UserAchievement implements FullUserAchievementData {
  achievement_id: number;
  earned_at: string;
  user_id: number;

  constructor(data: FullUserAchievementData) {
    this.achievement_id = data.achievement_id;
    ((this.earned_at = data.earned_at), (this.user_id = data.user_id));
  }

  static async create(data: BaseUserAchievementData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO user_achievements (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM user_achievements WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByUser(userId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE user_id = ?;`;

      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByAchievement(achievementId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_achievements WHERE achievement_id = ?;`;

      const values = [achievementId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async delete(id: number) {
    try {
      const db = createConnection();

      const values = Object.values(id);

      const query = `DELETE user_achievements WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default UserAchievement;
