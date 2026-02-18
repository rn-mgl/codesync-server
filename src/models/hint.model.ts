import { createConnection } from "@src/database/database";
import type {
  AdditionalHintData,
  BaseHintData,
  FullHintData,
} from "@src/interface/hint.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class Hint implements FullHintData {
  hint_level: number;
  hint_text: string;
  problem_id: number;
  order_index: number;

  constructor(data: FullHintData) {
    this.hint_level = data.hint_level;
    this.hint_text = data.hint_text;
    this.problem_id = data.problem_id;
    this.order_index = data.order_index;
  }

  static async create(data: BaseHintData & Partial<AdditionalHintData>) {
    try {
      const db = createConnection();

      const columns = Object.keys(data)
        .map((column) => column)
        .join(", ");
      const values = Object.values(data);
      const preparedValues = values.map((value) => `?`).join(", ");

      const query = `INSERT INTO hints (${columns}) VALUES (${preparedValues});`;

      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all() {
    try {
      const db = createConnection();

      const query = `SELECT * FROM hints;`;

      const [result, fields] = await db.execute<RowDataPacket[]>(query);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM hints WHERE id = ?;`;

      const values = [id];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByProblem(problemId: number) {
    try {
      const db = createConnection();

      const query = `SELECT * FROM hints WHERE problem_id = ?;`;

      const values = [problemId];

      const [result, fields] = await db.execute<RowDataPacket[]>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseHintData & AdditionalHintData>,
  ) {
    try {
      const db = createConnection();

      const update = Object.keys(updates)
        .map((column) => `${column} = ?`)
        .join(", ");
      const values = Object.values(updates);

      const query = `UPDATE hints SET ${update} WHERE id = ?;`;

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

export default Hint;
