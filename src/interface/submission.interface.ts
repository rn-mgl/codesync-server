export interface BaseSubmissionData {
  user_id: number;
  problem_id: number;
  code: string;
  language: string;
  status: SUBMISSION_STATUS;
}

export interface AdditionalSubmissionData {
  execution_time_ms: number;
  memory_used_kb: number;
  test_results: string;
  error_message: string;
}

export interface SubmissionType {
  type: "test" | "run";
}

type SUBMISSION_STATUS =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "compilation_error";

export type FullSubmissionData = BaseSubmissionData & AdditionalSubmissionData;
