import type { JudgeSuccessOutput } from "./sandbox.interface";
import type { FullTestCaseData } from "./test-case.interface";

export interface BaseSubmissionData {
  user_id: number;
  problem_id: number;
  code: string;
  language: SupportedLanguages;
  status: SubmissionStatus;
}

export interface AdditionalSubmissionData {
  execution_time_ms: number;
  memory_used_mb: number;
  test_results: string | null;
  error_message: string | null;
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
    failed: { testCase: FullTestCaseData | null; output: unknown | null };
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
