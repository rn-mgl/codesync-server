export interface BaseProblemTopicData {
  id: number;
  problem_id: number;
  topic_id: number;
  deleted_at: string | null;
}

export type CreateProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "problem_id" | "topic_id"
>;

export type UpdateProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "deleted_at"
>;

export type SoftDeleteProblemTopicPayload = Pick<
  BaseProblemTopicData,
  "deleted_at"
>;
