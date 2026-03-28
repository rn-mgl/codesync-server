export interface BaseSubmissionData {
  user_id: number;
  problem_id: number;
  code: string;
  language: SupportedLanguages;
  status: SubmissionStatus;
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

export type SupportedLanguages = "javascript" | "php";

export type SubmissionStatus =
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
