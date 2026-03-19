export interface BaseSubmissionData {
  user_id: number;
  problem_id: number;
  code: string;
  language: SUPPORTED_LANGUAGES;
  status: SUBMISSION_STATUS;
}

export interface AdditionalSubmissionData {
  execution_time_ms: number;
  memory_used_kb: number;
  test_results: string;
  error_message: string;
  deleted_at: string | null;
}

export interface SubmissionType {
  type: "test" | "run";
}

export type SUPPORTED_LANGUAGES = "javascript" | "php";

export type SUBMISSION_STATUS =
  | "processing"
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "compilation_error";

export interface PostSubmissionData extends Pick<
  BaseSubmissionData,
  "code" | "language"
> {
  problem: string;
}

export interface FullSubmissionData
  extends BaseSubmissionData, AdditionalSubmissionData {
  id: number;
}
