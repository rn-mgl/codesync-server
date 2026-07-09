import { createConnection } from "@src/database/database";
import type {
  AdditionalUserProgressData,
  BaseUserProgressData,
  FullUserProgressData,
} from "@src/interface/user.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class UserProgress implements FullUserProgressData {
  id: number;
  problems_solved_today: number;
  progress_data: string;
  streak_days: number;
  submissions_made: number;
  time_spent_seconds: number;
  user_id: number;

  constructor(data: FullUserProgressData) {
    this.id = data.id;
    this.problems_solved_today = data.problems_solved_today;
    this.progress_data = data.progress_data;
    this.streak_days = data.streak_days;
    this.submissions_made = data.submissions_made;
    this.time_spent_seconds = data.time_spent_seconds;
    this.user_id = data.user_id;
  }

  static async create(
    data: BaseUserProgressData & Partial<AdditionalUserProgressData>,
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO user_progress (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM user_progress WHERE id = ?;`;

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

      const query = `SELECT * FROM user_progress WHERE user_id = ?;`;

      const values = [userId];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByDate(date: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM user_progress WHERE progress_date = ?;`;

      const values = [date];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async update(id: number, updates: Partial<FullUserProgressData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE user_progress SET ${update} WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default UserProgress;
