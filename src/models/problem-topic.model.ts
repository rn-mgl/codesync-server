import { createConnection } from "@src/database/database";
import type { CreateProblemTopicPayload } from "@src/interface/problem-topic.interface";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

class ProblemTopic {
  static async create(data: CreateProblemTopicPayload[]) {
    try {
      if (!data || !data[0]) {
        throw new Error(`Invalid data.`);
      }

      const db = createConnection();

      const columns = [
        "problem_id",
        "topic_id",
      ] as const satisfies readonly (keyof CreateProblemTopicPayload)[];

      const preparedColumns = columns.join(", ");

      const preparedValues = data
        .map(() => `(${columns.map(() => "?").join(", ")})`) // (?, ?)
        .join(", "); // (?, ?), (?, ?) ...

      // follow positional rule: problem_id, topic_id
      const values = data.flatMap((row) =>
        columns.map((column) => row[column]),
      );

      const query = `INSERT INTO problem_topics (${preparedColumns}) VALUES ${preparedValues};`;
      const result = await db.execute<ResultSetHeader>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByProblem(id: number) {
    try {
      const db = createConnection();
      const values = [id];

      const query = `SELECT * FROM problem_topics WHERE problem_id = ?;`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async findByTopic(id: number) {
    try {
      const db = createConnection();
      const values = [id];

      const query = `SELECT * FROM problem_topics WHERE topic_id = ?;`;
      const result = await db.execute<RowDataPacket[]>(query, values);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }

  static async destroy(ids: number[]) {
    try {
      if (!ids.length) {
        throw new Error(`Invalid data.`);
      }

      const db = createConnection();

      const preparedIds = ids.map(() => "?").join(", ");

      const query = `DELETE FROM problem_topics WHERE id IN (${preparedIds});`;
      const result = await db.execute<ResultSetHeader>(query, [...ids]);

      return result[0];
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default ProblemTopic;
