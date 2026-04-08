import AppError from "@src/errors/app.error";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  JudgeOutput,
  SandboxServiceData,
} from "@src/interface/sandbox.interface";
import type {
  PostSubmissionData,
  SubmissionType,
  SupportedLanguages,
} from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import { StatusCodes } from "http-status-codes";
import { SandboxService } from "./sandbox.service";

export const loadExecutionContext = async (
  submission: PostSubmissionData & SubmissionType,
): Promise<{ problem: FullProblemData; testCases: FullTestCaseData[] }> => {
  const problems = (await Problem.findBySlug(
    submission.problem,
  )) as FullProblemData[];

  if (!problems.length || !problems[0]) {
    throw new AppError(
      `The problem ${submission.problem} does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const problem = problems[0];

  const testCaseOptions =
    submission.type === "test" ? { is_sample: true } : { is_hidden: true };

  const testCases = (await TestCase.findByProblem(
    problem.id,
    testCaseOptions,
  )) as FullTestCaseData[];

  return { problem, testCases };
};

export const normalizeSubmittedCode = (submitted: {
  language: SupportedLanguages;
  code: string;
}) => {
  let normalized = submitted.code;

  switch (submitted.language) {
    case "php":
      const stripTags = ["<?php", "?>", "<?"];

      for (const tag of stripTags) {
        normalized = normalized.replaceAll(tag, "");
      }
      break;
  }

  return normalized;
};

export const executeSubmission = async (submission: SandboxServiceData) => {
  const code = normalizeSubmittedCode({
    language: submission.language,
    code: submission.code,
  });

  const sandbox = new SandboxService({ ...submission, code });

  const processedCode: JudgeOutput = await sandbox.compileAndRunCode();

  return processedCode;
};
