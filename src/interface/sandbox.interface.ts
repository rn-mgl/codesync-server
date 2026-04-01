import type { FullProblemData } from "./problem.interface";
import type { SupportedLanguages } from "./submission.interface";
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
export interface SuccessCodeExecute {
  success: true;
  output: TestCaseOutput;
}

export interface ErrorCodeExecute {
  success: false;
  message: string;
}

export type CodeExecuteOutput = SuccessCodeExecute | ErrorCodeExecute;

export type JudgeOutput = Record<
  string,
  { result: boolean; memory: number; run_time: number }
>;
