import type { JudgeSuccessOutput } from "./sandbox.interface";
import type { BaseTestCaseData } from "./test-case.interface";

export interface BaseSubmissionData {
  id: number;
  user_id: number;
  problem_id: number;
  code: string;
  language: SupportedLanguages;
  status: SubmissionStatus;
  execution_time_ms: number;
  memory_used_mb: number;
  test_results: JudgeSuccessOutput | null;
  error_message: string | null;
  created_at: string;
  deleted_at: string | null;
}

export type SubmissionPayload = Pick<
  BaseSubmissionData,
  | "user_id"
  | "problem_id"
  | "code"
  | "language"
  | "status"
  | "execution_time_ms"
  | "memory_used_mb"
  | "test_results"
  | "error_message"
>;

export interface SubmissionType {
  type: "test" | "run";
}

export type SupportedLanguages = "javascript" | "php" | "java";

export type SubmissionStatus =
  | "processing"
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "compilation_error";

export interface CreateSubmissionPayload extends Pick<
  BaseSubmissionData,
  "code" | "language"
> {
  problem: string;
}

export type SuccessAnalysisResult = {
  success: true;
  status: SubmissionStatus;
  memoryUsedMb: number;
  executionTimeMs: number;
  testResults: JudgeSuccessOutput;
  summary: {
    total: number;
    passed: number;
    memory: number;
    runtime: number;
    failed: { testCase: BaseTestCaseData | null; output: unknown };
  };
};

export type ErrorAnalysisResult = {
  success: false;
  status: SubmissionStatus;
  message: string;
};

export type AnalysisResult = SuccessAnalysisResult | ErrorAnalysisResult;

export type SubmissionStatistics = {
  memory: { mb: number; percentage: number }[];
  runtime: { ms: number; percentage: number }[];
};

export type ValidSubmissionLookups = "id" | "user" | "problem" | "status";
