export interface BaseAttemptData {
  user_id: number;
  problem_id: number;
  attempt_count: number;
  hints_used: number;
  time_spent_seconds: number;
}

export interface AdditionalAttemptData {
  is_solved: boolean;
}

export type FullAttemptData = BaseAttemptData & AdditionalAttemptData;
