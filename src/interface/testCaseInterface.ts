export interface BaseTestCaseData {
  problem_id: number;
  input: string;
  expected_output: string;
  time_limit_ms: number;
  memory_limit_mb: number;
}

export interface AdditionalTestCaseData {
  order_index: number;
}

export type FullTestCaseData = BaseTestCaseData & AdditionalTestCaseData;
