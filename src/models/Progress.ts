import { createConnection } from "@src/database/database";
import type {
  AdditionalProgressData,
  BaseProgressData,
  FullProgressData,
} from "@src/interface/progressInterface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Progress implements FullProgressData {
  problems_solved_today: number;
  progress_data: string;
  streak_days: number;
  submissions_made: number;
  time_spent_seconds: number;
  user_id: number;

  constructor(data: FullProgressData) {
    this.problems_solved_today = data.problems_solved_today;
    this.progress_data = data.progress_data;
    this.streak_days = data.streak_days;
    this.submissions_made = data.submissions_made;
    this.time_spent_seconds = data.time_spent_seconds;
    this.user_id = data.user_id;
  }

  static async create(
    data: BaseProgressData & Partial<AdditionalProgressData>
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO progress (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM progress WHERE id = ?;`;

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

      const query = `SELECT * FROM progress WHERE user_id = ?;`;

      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByDate(date: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM progress WHERE progress_date = ?;`;

      const values = [date];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullProgressData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE progress SET ${update} WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Progress;
