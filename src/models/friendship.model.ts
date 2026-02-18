import { createConnection } from "@src/database/database";
import type {
  BaseFriendshipData,
  FRIENDSHIP_STATUS,
  FullFriendshipData,
} from "@src/interface/friendship.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Friendship implements FullFriendshipData {
  accepted_at: string;
  friend_id: number;
  requested_at: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  user_id: number;

  constructor(data: FullFriendshipData) {
    this.accepted_at = data.accepted_at;
    this.friend_id = data.friend_id;
    this.requested_at = data.requested_at;
    this.status = data.status;
    this.user_id = data.user_id;
  }

  static async create(data: BaseFriendshipData) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO friendships (${columns}) VALUES (${preparedValues});`;
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

      const query = `SELECT * FROM friendships WHERE id = ?;`;

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

      const query = `SELECT * FROM friendships WHERE user_id = ?;`;

      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByStatus(status: string) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM friendships WHERE status = ?;`;

      const values = [status];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullFriendshipData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE friendships ${update} WHERE id = ?;`;

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

export default Friendship;
