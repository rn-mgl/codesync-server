import { createConnection } from "@src/database/database";
import type { ProblemTopicPayload } from "@src/interface/problem-topic.interface";
import type { ResultSetHeader } from "mysql2";

class ProblemTopic {
  static async create(data: ProblemTopicPayload[]) {
    try {
      if (!data || !data[0]) return;

      const db = createConnection();

      // cleanup/standardize
      const columns = Object.keys(data[0])
        .map((key) => key)
        .join(", ");

      const values = Object.entries(data)
        .map(([key, value]) => {
          return [value.problem_id, value.topic_id];
        })
        .flat();

      // cleanup/standardize
      const preparedValues = Object.values(data)
        .map(
          (payload) =>
            `(${Object.keys(payload)
              .map((key) => "?")
              .join(", ")})`,
        )
        .join(", ");

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
