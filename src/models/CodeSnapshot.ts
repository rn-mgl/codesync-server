import { createConnection } from "@src/database/database";
import type {
  AdditionalCodeSnapshotData,
  BaseCodeSnapshotData,
  FullCodeSnapshotData,
} from "@src/interface/codeSnapshot";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class CodeSnapshot implements FullCodeSnapshotData {
  change_type: "replace" | "insert" | "delete";
  code_content: string;
  cursor_pointer: string;
  line_number: number;
  session_id: number;
  user_id: number;

  constructor(data: FullCodeSnapshotData) {
    this.change_type = data.change_type;
    this.code_content = data.code_content;
    this.cursor_pointer = data.cursor_pointer;
    this.line_number = data.line_number;
    this.session_id = data.session_id;
    this.user_id = data.user_id;
  }

  static async create(
    data: BaseCodeSnapshotData & Partial<AdditionalCodeSnapshotData>
  ) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => "?");

      const query = `INSERT INTO code_snapshots (${columns}) VALUES (${preparedValues});`;

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

      const query = `SELECT * FROM code_snapshots WHERE id = ?;`;

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

      const query = `SELECT * FROM code_snapshots WHERE session_id = ?;`;

      const values = [sessionId];

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

      const query = `SELECT * FROM code_snapshots WHERE user_id = ?;`;

      const values = [userId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default CodeSnapshot;
