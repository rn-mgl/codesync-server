export interface BaseSubmissionData {
  user_id: number;
  problem_id: number;
  code: string;
  language: string;
  status: string;
}

export interface AdditionalSubmissionData {
  execution_time_ms: number;
  memory_used_kb: number;
  test_results: string;
  error_message: string;
}

export type FullSubmissionData = BaseSubmissionData & AdditionalSubmissionData;
