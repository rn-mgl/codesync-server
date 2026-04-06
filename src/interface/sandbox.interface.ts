import type { FullProblemData } from "./problem.interface";
import type {
  SubmissionStatus,
  SupportedLanguages,
} from "./submission.interface";
import type { FullTestCaseData } from "./test-case.interface";

export interface SandboxData {
  command: string;
  image: string;
  extension: string;
}

export interface SandboxServiceData {
  code: string;
  language: SupportedLanguages;
  problem: FullProblemData;
  testCases: FullTestCaseData[];
}

export type TestCaseOutput = Record<
  string,
  {
    memory: {
      before: number;
      after: number;
    };
    cpu: {
      before: number;
      after: number;
    };
    result: unknown;
  }
>;

export type JudgeSuccessOutput = Record<
  string,
  { matched: boolean; memory: number; run_time: number; result: unknown }
>;

export type JudgeErrorOutput = Record<
  string,
  { matched: boolean; memory: number; run_time: number; result: unknown }
>;

export type JudgeOutput =
  | {
      success: true;
      output: JudgeSuccessOutput;
    }
  | {
      success: false;
      error: Exclude<
        SubmissionStatus,
        "processing" | "accepted" | "wrong_answer"
      >;
      message: string;
    };
