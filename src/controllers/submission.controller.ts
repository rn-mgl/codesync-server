import AppError from "@src/errors/app.error";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  JudgeOutput,
  JudgeSuccessOutput,
} from "@src/interface/sandbox.interface";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
  FullSubmissionData,
} from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import Submission from "@src/models/submission.model";
import TestCase from "@src/models/test-case.model";
import { SandboxService } from "@src/services/sandbox.service";
import {
  assignField,
  isAdditionalSubmissionData,
  isBaseSubmissionData,
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidPostSubmissionData,
  isValidSubmissionType,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;
  const user = req.app.get("user");

  if (!("submission" in body) || typeof body.submission !== "object") {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { submission } = body;

  if (!isValidSubmissionType(submission)) {
    throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }

  const type = submission.type;

  if (!isValidPostSubmissionData(submission)) {
    throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }

  const problem = (await Problem.findBySlug(
    submission.problem,
  )) as FullProblemData[];

  if (!problem.length || !problem[0]) {
    throw new AppError(
      `The problem ${submission.problem} does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const testCaseOptions =
    submission.type === "test" ? { is_sample: true } : { is_hidden: true };

  const testCases = (await TestCase.findByProblem(
    problem[0].id,
    testCaseOptions,
  )) as FullTestCaseData[];

  let code = submission.code;

  switch (submission.language) {
    case "php":
      const stripTags = ["<?php", "?>", "<?"];

      for (const tag of stripTags) {
        code = code.replaceAll(tag, "");
      }
      break;
  }

  const sandbox = new SandboxService({
    code: code,
    language: submission.language,
    problem: problem[0],
    testCases: testCases,
  });

  const processedCode: JudgeOutput = await sandbox.compileAndRunCode();

  switch (type) {
    case "run":
      const totalTestCases = testCases.length;

      const createSubmission: BaseSubmissionData &
        Partial<AdditionalSubmissionData> = {
        user_id: user.id,
        problem_id: problem[0].id,
        code: submission.code,
        language: submission.language,
        status: "processing",
        memory_used_mb: 0,
        execution_time_ms: 0,
        test_results: null,
        error_message: null,
      };

      let failedTestCase: FullTestCaseData | null = null;
      let firstFailedOutput: unknown | null = null;
      let passedTestCases: number = 0;
      let averageMemoryUsed: number = 0;
      let averageRunTime: number = 0;
      let codeOutput: JudgeSuccessOutput | null = null;
      let statistics: {
        memory: { mb: number; percentage: number }[];
        runtime: { ms: number; percentage: number }[];
      } | null = null;

      if (processedCode.success) {
        codeOutput = processedCode.output;

        const firstFailedTestCase = Object.entries(codeOutput).find(
          ([id, output]) => !output.matched,
        )?.[0];

        failedTestCase = firstFailedTestCase
          ? (testCases.find((tc) => tc.id === Number(firstFailedTestCase)) ??
            null)
          : null;

        firstFailedOutput = firstFailedTestCase
          ? codeOutput[firstFailedTestCase]?.result
          : null;

        passedTestCases = Object.values(codeOutput).reduce((count, output) => {
          return output.matched ? count + 1 : count;
        }, 0);

        const sumMemoryUsed = Object.values(codeOutput).reduce(
          (count, output) => {
            return output.memory + count;
          },
          0,
        );

        const sumRunTime = Object.values(codeOutput).reduce((count, output) => {
          return output.run_time + count;
        }, 0);

        averageMemoryUsed = Number((sumMemoryUsed / totalTestCases).toFixed(2));

        averageRunTime = Number((sumRunTime / totalTestCases).toFixed(2));

        createSubmission.status = failedTestCase ? "wrong_answer" : "accepted";
        createSubmission.memory_used_mb = averageMemoryUsed;
        createSubmission.execution_time_ms = averageRunTime;
        createSubmission.test_results = JSON.stringify(codeOutput);
      } else {
        createSubmission.status = processedCode.error;
        createSubmission.error_message = processedCode.message;
      }

      if (!isBaseSubmissionData(createSubmission)) {
        throw new AppError(`Invalid submission data.`, StatusCodes.BAD_REQUEST);
      }

      const createData: BaseSubmissionData & Partial<AdditionalSubmissionData> =
        {
          code: createSubmission.code,
          language: createSubmission.language,
          problem_id: createSubmission.problem_id,
          status: createSubmission.status,
          user_id: createSubmission.user_id,
        };

      if (isAdditionalSubmissionData(createSubmission, "partial")) {
        const FIELDS: (keyof AdditionalSubmissionData)[] = [
          "error_message",
          "execution_time_ms",
          "memory_used_mb",
          "test_results",
        ];

        for (const field of FIELDS) {
          const value =
            createSubmission[field as keyof AdditionalSubmissionData];
          if (value !== undefined) {
            assignField(field, value, createData);
          }
        }
      }

      const created = await Submission.create(createData);

      if (!created) {
        throw new AppError(
          `An error occurred during submission.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      if (!processedCode.success) {
        throw new AppError(processedCode.message, StatusCodes.BAD_REQUEST);
      }

      if (createSubmission.status === "accepted") {
        const acceptedSubmissions = (await Submission.all({
          status: "accepted",
        })) as FullSubmissionData[];

        const memoryMap = new Map<number, number>();
        const runtimeMap = new Map<number, number>();

        for (const accepted of acceptedSubmissions) {
          const roundedMemory = accepted.memory_used_mb;
          const roundedRuntime = accepted.execution_time_ms;

          memoryMap.set(roundedMemory, (memoryMap.get(roundedMemory) ?? 0) + 1);

          runtimeMap.set(
            roundedRuntime,
            (runtimeMap.get(roundedRuntime) ?? 0) + 1,
          );
        }

        statistics = { memory: [], runtime: [] };

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
      }

      return res
        .status(!!created ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          success: !!created,
          data: {
            judge: codeOutput,
            summary: {
              total: totalTestCases,
              passed: passedTestCases,
              memory: averageMemoryUsed,
              runtime: averageRunTime,
              failed: { testCase: failedTestCase, output: firstFailedOutput },
              code: createData.code,
              statistics,
            },
          },
        });
    case "test":
      if (!processedCode.success) {
        throw new AppError(
          processedCode.message,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        data: { judge: processedCode.output },
      });

    default:
      throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }
};

export const all = async (req: Request, res: Response) => {
  const submissions = await Submission.all();

  return res.json({ submissions });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let submission: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      submission = await Submission.findById(id);

      return res.json({ submission });
    case "user":
      const userId = parseInt(params.identifier);

      submission = await Submission.findByUser(userId);

      return res.json({ submission });
    case "problem":
      const problemId = parseInt(params.identifier);

      submission = await Submission.findByProblem(problemId);

      return res.json({ submission });
    case "status":
      const status = params.identifier;

      submission = await Submission.findByStatus(status);

      return res.json({ submission });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
