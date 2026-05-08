export interface BaseProblemTopicData {
  id: number;
  problem_id: number;
  topic_id: number;
  deleted_at: string;
}

export type ProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "problem_id" | "topic_id"
>;

export type SoftDeleteProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "deleted_at"
>;
