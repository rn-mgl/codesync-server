import { createConnection } from "@src/database/database";
import type {
  AdditionalChatMessageData,
  BaseChatMessageData,
  FullChatMessageData,
} from "@src/interface/chatMessage";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class ChatMessages implements FullChatMessageData {
  deleted_at: string | null;
  message: string;
  message_type: "text" | "code" | "system";
  sender_id: number;
  session_id: number;

  constructor(data: FullChatMessageData) {
    this.deleted_at = data.deleted_at;
    this.message = data.message;
    this.message_type = data.message_type;
    this.sender_id = data.sender_id;
    this.session_id = data.session_id;
  }

  static async create(
    data: BaseChatMessageData & Partial<AdditionalChatMessageData>
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?").join(", ");

      const query = `INSERT INTO chat_messages (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM chat_messages WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findBySession(sessionId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM chat_messages WHERE session_id = ?;`;

      const values = [sessionId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullChatMessageData>) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE chat_messages SET ${updates} WHERE id = ?;`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default ChatMessages;
