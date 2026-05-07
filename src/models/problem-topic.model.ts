import { createConnection } from "@src/database/database";
import type { ProblemTopicPayload } from "@src/interface/problem-topic.interface";
import type { ResultSetHeader } from "mysql2";

class ProblemTopic {
  static async create(data: ProblemTopicPayload[]) {
    try {
      if (!data || !data[0]) return;

      const db = createConnection();

      const keys = Object.keys(data[0]);
      const columns = keys.join(", ");

      const nestedValues = Object.values(data).map((value) => {
        return [value.problem_id, value.topic_id];
      });

      const preparedValues = nestedValues
        .map((value) => {
          const mapped = `(${value.map((v) => "?").join(", ")})`; // (?, ?, ...)

          return mapped;
        })
        .join(", "); // (?, ?), (?, ?)...

      const values = nestedValues.flat();

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
