export interface BaseProblemTopicData {
  id: number;
  problem_id: number;
  topic_id: number;
}

export type CreateProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "problem_id" | "topic_id"
>;
