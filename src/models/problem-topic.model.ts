import { createConnection } from "@src/database/database";
import type { ProblemTopicPayload } from "@src/interface/problem-topic.interface";
import type { ResultSetHeader } from "mysql2";

class ProblemTopic {
  static async create(data: ProblemTopicPayload[]) {
    try {
      if (!data || !data[0]) return;

      const db = createConnection();

      const columns = [
        "problem_id",
        "topic_id",
      ] as const satisfies readonly (keyof ProblemTopicPayload)[];

      const preparedValues = data
        .map(() => `(${columns.map(() => "?").join(", ")})`) // (?, ?)
        .join(", "); // (?, ?), (?, ?) ...

      // follow positional rule: problem_id, topic_id
      const values = data.flatMap((row) =>
        columns.map((column) => row[column]),
      );

      const query = `INSERT INTO problem_topics (${columns}) VALUES ${preparedValues};`;
      const [result, fields] = await db.execute<ResultSetHeader>(query, values);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred during the operation.");
    }
  }
}

export default ProblemTopic;
