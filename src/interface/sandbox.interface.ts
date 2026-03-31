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
