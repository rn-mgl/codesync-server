import type { BaseProblemData } from "./problem.interface";
import type {
  SubmissionStatus,
  SupportedLanguages,
} from "./submission.interface";
import type { BaseTestCaseData } from "./test-case.interface";

export interface SandboxData {
  command: string;
  image: string;
  extension: string;
}

export interface SandboxServiceData {
  code: string;
  language: SupportedLanguages;
  problem: BaseProblemData;
  testCases: BaseTestCaseData[];
}

type TestCaseOutput = Record<
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
    logs: unknown[];
  }
>;

export type ExecuteCodeOutput = TestCaseOutput;

export type JudgeSuccessOutput = Record<
  string,
  {
    matched: boolean;
    memory: number;
    run_time: number;
    result: unknown;
    logs: unknown[];
  }
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
