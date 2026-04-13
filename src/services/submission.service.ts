import AppError from "@src/errors/app.error";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  JudgeOutput,
  SandboxServiceData,
} from "@src/interface/sandbox.interface";
import type {
  AnalysisResult,
  FullSubmissionData,
  PostSubmissionData,
  SubmissionStatistics,
  SubmissionStatus,
  SubmissionType,
  SupportedLanguages,
} from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import Submission from "@src/models/submission.model";
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

const normalizeSubmittedCode = (language: SupportedLanguages, code: string) => {
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
};

export const executeSubmission = async (submission: SandboxServiceData) => {
  const code = normalizeSubmittedCode(submission.language, submission.code);

  const sandbox = new SandboxService({ ...submission, code });

  const processedCode: JudgeOutput = await sandbox.compileAndRunCode();

  return processedCode;
};

export const analyzeResult = (
  processedCode: JudgeOutput,
  testCases: FullTestCaseData[],
): AnalysisResult => {
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
    ([id, output]) => !output.matched,
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
    return output.run_time + count;
  }, 0);

  const averageMemoryUsed = Number((sumMemoryUsed / totalTestCases).toFixed(2));

  const averageRunTime = Number((sumRunTime / totalTestCases).toFixed(2));

  return {
    success: true,
    status: failedTestCase
      ? "wrong_answer"
      : ("accepted" as Extract<SubmissionStatus, "wrong_answer" | "accepted">),
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
};

export const buildSubmissionStatistics = async (problemId: number) => {
  const acceptedSubmissions = (await Submission.all({
    status: "accepted",
    problem_id: problemId,
  })) as FullSubmissionData[];

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
};
