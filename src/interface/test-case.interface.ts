export interface BaseTestCaseData {
  id: number;
  problem_id: number;
  input: Record<string, unknown> | string;
  expected_output: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  is_sample: boolean;
  is_hidden: boolean;
  order_index: number;
  deleted_at: string | null;
}

export type TestCasePayload = Pick<
  BaseTestCaseData,
  | "problem_id"
  | "input"
  | "expected_output"
  | "time_limit_ms"
  | "memory_limit_mb"
  | "is_sample"
  | "is_hidden"
  | "order_index"
>;
