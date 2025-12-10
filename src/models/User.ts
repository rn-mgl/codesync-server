import type { FullUserData } from "@src/interface/user-interface.ts";
import db from "@database/database.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class User implements FullUserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  problems_solved: number;
  total_submissions: number;

  constructor(data: FullUserData) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.problems_solved = data.problems_solved;
    this.total_submissions = data.total_submissions;
  }

  static async create(data: Record<string, string | number | boolean>) {
    try {
      const insert = Object.keys(data)
        .map((key) => `${key}`)
        .join(", ");

      const preparedValues = Object.values(data)
        .map((value) => "?")
        .join(", ");

      const values = Object.values(data);

      const query = `INSERT INTO users (${insert})
                      VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async findById(id: string | number) {
    try {
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
      const query = `SELECT * FROM users WHERE email = ?;`;

      const values = [email];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async updateById(
    id: number,
    updates: Record<string, string | number | boolean>
  ) {
    try {
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
