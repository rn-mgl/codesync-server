import type {
  AdditionalUserData,
  BaseUserData,
  FullUserData,
} from "@src/interface/user.interface";
import { createConnection } from "@database/database";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class User implements FullUserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  problems_solved: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  deleted_at: string | null;

  constructor(data: FullUserData) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.problems_solved = data.problems_solved;
    this.total_submissions = data.total_submissions;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.is_verified = data.is_verified;
    this.deleted_at = data.deleted_at;
  }

  static async create(data: BaseUserData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((key) => `${key}`)
        .join(", ");

      const values = Object.values(data);

      const preparedValues = values.map(() => "?").join(", ");

      const query = `INSERT INTO users (${columns}) VALUES (${preparedValues});`;

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users WHERE deleted_at IS NULL;`;

      const result = await db.execute(query);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findById(id: string | number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users WHERE id = ? AND deleted_at IS NULL;`;

      const values = [id];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async findByEmail(email: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL;`;

      const values = [email];

      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async find(data: Record<string, string | number>) {
    try {
      const db = createConnection();

      const mappedWhere = Object.keys(data)
        .map((column) => `${column} = ?`)
        .join(" AND ");
      const values = Object.values(data);

      const query = `SELECT * FROM users WHERE ${mappedWhere} AND deleted_at IS NULL;`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseUserData & AdditionalUserData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE users SET ${update} WHERE id = ?;`;

      const result = await db.execute<ResultSetHeader>(query, [...values, id]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }

  static async delete(id: number) {
    try {
      const db = createConnection();

      const query = `DELETE FROM users WHERE id = ?;`;

      const values = [id];

      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error(`An error occurred during the operation.`);
    }
  }
}

export default User;
