import type { FullUserData } from "@src/interface/user-interface.ts";
import { createConnection } from "@database/database.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class User implements FullUserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  problems_solved: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;

  constructor(data: FullUserData) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.problems_solved = data.problems_solved;
    this.total_submissions = data.total_submissions;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data: Record<string, string | number | boolean>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((key) => `${key}`)
        .join(", ");

      const values = Object.values(data);

      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO users (${columns}) VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users;`;

      const [result, fields] = await db.execute(query);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async findById(id: string | number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async findByEmail(email: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users WHERE email = ?;`;

      const values = [email];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async update(
    id: number,
    updates: Record<string, string | number | boolean>
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE users SET ${update} WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, [
        ...values,
        id,
      ]);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteById(id: number) {
    try {
      const db = createConnection();

      const query = `DELETE FROM users WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

export default User;
