import AppError from "@src/errors/app.error";
import type { BaseProblemData } from "@src/interface/problem.interface";
import type {
  JudgeOutput,
  SandboxServiceData,
} from "@src/interface/sandbox.interface";
import type {
  AnalysisResult,
  BaseSubmissionData,
  CreateSubmissionPayload,
  SubmissionPayload,
  SubmissionStatistics,
  SubmissionType,
  SupportedLanguages,
  ValidSubmissionLookups,
} from "@src/interface/submission.interface";
import type { BaseTestCaseData } from "@src/interface/test-case.interface";
import Submission from "@src/models/submission.model";
import { assignField, type ValidationType } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";
import { getProblemByLookup } from "./problem.service";
import { SandboxService } from "./sandbox.service";
import { getTestCaseByLookup } from "./test-case.service";

export function buildSubmissionPayload(
  submission: SubmissionPayload,
  type?: "full",
): SubmissionPayload;

export function buildSubmissionPayload(
  submission: Partial<SubmissionPayload>,
  type: "partial",
): Partial<SubmissionPayload>;

export function buildSubmissionPayload(
  submission: SubmissionPayload | Partial<SubmissionPayload>,
  type: ValidationType = "full",
): typeof type extends "full" ? SubmissionPayload : Partial<SubmissionPayload> {
  const payload: SubmissionPayload | Partial<SubmissionPayload> = {};

  const FIELDS: (keyof SubmissionPayload)[] = [
    "code",
    "error_message",
    "execution_time_ms",

    "language",
    "memory_used_mb",
    "problem_id",
    "status",
    "test_results",
    "user_id",
  ];

  for (const field of FIELDS) {
    const value = submission[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    } else if (value === undefined && type === "full") {
      throw new AppError(`All values are required.`, StatusCodes.BAD_REQUEST);
    }
  }

  return payload;
}

export async function loadExecutionContext(
  submission: CreateSubmissionPayload & SubmissionType,
): Promise<{ problem: BaseProblemData; testCases: BaseTestCaseData[] }> {
  const problem = await getProblemByLookup(submission.problem, "slug");

  const testCaseOptions =
    submission.type === "test" ? { is_sample: true } : { is_hidden: true };

  const testCases = await getTestCaseByLookup(
    problem.id,
    "problem",
    testCaseOptions,
  );

  return { problem, testCases };
}

function normalizeSubmittedCode(language: SupportedLanguages, code: string) {
  let normalized = code;

  switch (language) {
    case "php":
      const stripTags = ["<?php", "?>", "<?"];

      for (const tag of stripTags) {
        normalized = normalized.replaceAll(tag, "");
      }
      break;
  }

  return normalized;
}

export async function executeSubmission(submission: SandboxServiceData) {
  const code = normalizeSubmittedCode(submission.language, submission.code);

  const sandbox = new SandboxService({ ...submission, code });

  const processedCode: JudgeOutput = await sandbox.compileAndRunCode();

  return processedCode;
}

export function analyzeResult(
  processedCode: JudgeOutput,
  testCases: BaseTestCaseData[],
): AnalysisResult {
  if (!processedCode.success) {
    return {
      success: false,
      status: processedCode.error,
      message: processedCode.message,
    };
  }

  const codeOutput = processedCode.output;
  const totalTestCases = testCases.length;

  const firstFailedTestCase = Object.entries(codeOutput).find(
    (data) => !data[1].matched,
  )?.[0];

  const failedTestCase = firstFailedTestCase
    ? (testCases.find((tc) => tc.id === Number(firstFailedTestCase)) ?? null)
    : null;

  const firstFailedOutput = firstFailedTestCase
    ? codeOutput[firstFailedTestCase]?.result
    : null;

  const passedTestCases = Object.values(codeOutput).reduce((count, output) => {
    return output.matched ? count + 1 : count;
  }, 0);

  const sumMemoryUsed = Object.values(codeOutput).reduce((count, output) => {
    return output.memory + count;
  }, 0);

  const sumRunTime = Object.values(codeOutput).reduce((count, output) => {
    return output.runtime + count;
  }, 0);

  const averageMemoryUsed = Number((sumMemoryUsed / totalTestCases).toFixed(2));

  const averageRunTime = Number((sumRunTime / totalTestCases).toFixed(2));

  return {
    success: true,
    status: failedTestCase ? "wrong_answer" : "accepted",
    memoryUsedMb: averageMemoryUsed,
    executionTimeMs: averageRunTime,
    testResults: codeOutput,
    summary: {
      total: totalTestCases,
      passed: passedTestCases,
      memory: averageMemoryUsed,
      runtime: averageRunTime,
      failed: { testCase: failedTestCase, output: firstFailedOutput },
    },
  };
}

export async function buildSubmissionStatistics(
  problemId: number,
  language: SupportedLanguages,
) {
  const acceptedSubmissions = (await Submission.all({
    status: "accepted",
    problem_id: problemId,
    language: language,
  })) as BaseSubmissionData[];

  const memoryMap = new Map<number, number>();
  const runtimeMap = new Map<number, number>();

  for (const accepted of acceptedSubmissions) {
    const roundedMemory = accepted.memory_used_mb;
    const roundedRuntime = accepted.execution_time_ms;

    memoryMap.set(roundedMemory, (memoryMap.get(roundedMemory) ?? 0) + 1);
    runtimeMap.set(roundedRuntime, (runtimeMap.get(roundedRuntime) ?? 0) + 1);
  }

  const statistics: SubmissionStatistics = { memory: [], runtime: [] };

  for (const [memory, count] of memoryMap.entries()) {
    const mbPercentage = (count / acceptedSubmissions.length) * 100;

    statistics.memory.push({
      mb: memory,
      percentage: Number(mbPercentage.toFixed(2)),
    });
  }

  for (const [runtime, count] of runtimeMap.entries()) {
    const msPercentage = (count / acceptedSubmissions.length) * 100;

    statistics.runtime.push({
      ms: runtime,
      percentage: Number(msPercentage.toFixed(2)),
    });
  }

  return statistics;
}

export async function getAllSubmissions(
  options?: Partial<BaseSubmissionData>,
): Promise<BaseSubmissionData[]> {
  const submissions = (await Submission.all(options)) as BaseSubmissionData[];

  return submissions;
}

export async function getSubmissionByLookup(
  identifier: string,
  lookup: "id",
): Promise<BaseSubmissionData>;

export async function getSubmissionByLookup(
  identifier: string,
  lookup: "user" | "problem" | "status",
): Promise<BaseSubmissionData[]>;

export async function getSubmissionByLookup(
  identifier: string,
  lookup: ValidSubmissionLookups,
): Promise<BaseSubmissionData | BaseSubmissionData[]> {
  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      const submissions = (await Submission.findById(
        id,
      )) as BaseSubmissionData[];

      if (!submissions || !submissions[0]) {
        throw new AppError(
          `The submission you're trying to find does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      const submission = submissions[0];

      return submission;

    case "user":
      const userId = Number(identifier);

      if (Number.isNaN(userId)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      return (await Submission.findByUser(userId)) as BaseSubmissionData[];
    case "problem":
      const problemId = Number(identifier);

      if (Number.isNaN(problemId)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      return (await Submission.findByProblem(
        problemId,
      )) as BaseSubmissionData[];
    case "status":
      const status = identifier;

      return (await Submission.findByStatus(status)) as BaseSubmissionData[];
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
}
