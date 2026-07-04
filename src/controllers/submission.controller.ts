import AppError from "@src/errors/app.error";
import {
  isValidCreateSubmissionPayload,
  isValidSubmissionLookupTypes,
  isValidSubmissionPayload,
  isValidSubmissionType,
} from "@src/guards/submission.guard";
import type { UserMiddleware } from "@src/interface/auth.interface";
import type { JudgeOutput } from "@src/interface/sandbox.interface";
import type {
  BaseSubmissionData,
  SubmissionPayload,
  SubmissionStatistics,
  SubmissionStatus,
} from "@src/interface/submission.interface";
import Submission from "@src/models/submission.model";
import { getProblemByLookup } from "@src/services/problem.service";
import { listener } from "@services/queue.service";
import {
  analyzeResult,
  buildSubmissionPayload,
  buildSubmissionStatistics,
  executeSubmission,
  getSubmissionByLookup,
  loadExecutionContext,
} from "@src/services/submission.service";
import { getTestCaseByLookup } from "@src/services/test-case.service";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
  isValidString,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;
  const user = req.user as UserMiddleware;

  if (!isValidObject(body)) {
    throw new AppError(
      `Invalid Submission data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const submissionPayload = body.submission;

  if (!isValidObject(submissionPayload)) {
    throw new AppError(
      `Invalid Submission data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!isValidSubmissionType(submissionPayload)) {
    throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }

  const type = submissionPayload.type;

  if (!isValidCreateSubmissionPayload(submissionPayload)) {
    throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }

  const { problem, testCases } = await loadExecutionContext(submissionPayload);

  const processedCode: JudgeOutput = await executeSubmission({
    code: submissionPayload.code,
    language: submissionPayload.language,
    problem: problem,
    testCases: testCases,
  });

  switch (type) {
    case "run":
      const analysis = analyzeResult(processedCode, testCases);

      const createSubmission: SubmissionPayload = {
        user_id: user.id,
        problem_id: problem.id,
        code: submissionPayload.code,
        language: submissionPayload.language,
        status: analysis.status,
        memory_used_mb: analysis.success ? analysis.memoryUsedMb : 0,
        execution_time_ms: analysis.success ? analysis.executionTimeMs : 0,
        test_results: analysis.success ? analysis.testResults : null,
        error_message: !analysis.success ? analysis.message : null,
      };

      if (!isValidSubmissionPayload(createSubmission)) {
        throw new AppError(`Invalid submission data.`, StatusCodes.BAD_REQUEST);
      }

      const createData = buildSubmissionPayload(createSubmission);

      const created = await Submission.create(createData);

      if (!created) {
        throw new AppError(
          `An error occurred during submission.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      // to throw errors/exceptions but still be saved in db
      if (!analysis.success) {
        throw new AppError(analysis.message, StatusCodes.BAD_REQUEST);
      }

      let statistics: SubmissionStatistics | null = null;

      if (createData.status === "accepted") {
        statistics = await buildSubmissionStatistics(
          problem.id,
          createData.language,
        );
      }

      await listener.add("catch_achievement", {
        userId: user.id,
        category: "problems",
      });

      return res
        .status(!!created ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          success: !!created,
          data: {
            judge: analysis.testResults,
            statistics: statistics,
            summary: {
              total: analysis.summary.total,
              passed: analysis.summary.passed,
              memory: analysis.summary.memory,
              runtime: analysis.summary.runtime,
              failed: analysis.summary.failed,
              code: createData.code,
              language: createData.language,
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
  const query = req.query;
  const user = req.user as UserMiddleware;

  if (!isValidObject(query)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidString(query.problem)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(query.problem, "slug");

  const options: Partial<BaseSubmissionData> = {
    problem_id: problem.id,
    user_id: user.id,
  };

  const submissions = await Submission.all(options);

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { submissions } });
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

  if (!isValidSubmissionLookupTypes(query.lookup)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  // for typescript narrowing - to cleanup
  if (query.lookup === "id") {
    const submission = await getSubmissionByLookup(params.identifier, "id");

    const payload: JudgeOutput =
      submission.error_message || !submission.test_results
        ? {
            success: false,
            error: submission.status as Exclude<
              SubmissionStatus,
              "processing" | "accepted" | "wrong_answer"
            >,
            message: submission.error_message as string,
          }
        : { success: true, output: submission.test_results };

    const testCases = await getTestCaseByLookup(
      submission.problem_id,
      "problem",
      { is_hidden: true },
    );

    const analysis = analyzeResult(payload, testCases);

    if (!analysis.success) {
      throw new AppError(analysis.message, StatusCodes.BAD_REQUEST);
    }

    let statistics = null;

    if (payload.success) {
      statistics = await buildSubmissionStatistics(
        submission.problem_id,
        submission.language,
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        judge: analysis.testResults,
        statistics: statistics,
        summary: {
          total: analysis.summary.total,
          passed: analysis.summary.passed,
          memory: analysis.summary.memory,
          runtime: analysis.summary.runtime,
          failed: analysis.summary.failed,
          code: submission.code,
          language: submission.language,
        },
      },
    });
  }

  const submission = await getSubmissionByLookup(
    params.identifier,
    query.lookup,
  );

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { submission } });
};
