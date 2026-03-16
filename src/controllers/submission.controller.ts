import AppError from "@src/errors/app.error";
import type { ServerResponse } from "@src/interface/server.interface";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
} from "@src/interface/submission.interface";
import Problem from "@src/models/problem.model";
import Submission from "@src/models/submission.model";
import { createSandboxFile, processCode } from "@src/services/sandbox.service";
import {
  assignField,
  isAdditionalSubmissionData,
  isBaseSubmissionData,
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

  let fileName: string | null = null;

  try {
    fileName = createSandboxFile(submission.language, submission.code);
  } catch (error) {
    throw new AppError(
      "An error occurred during code processing.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  let processedCode: { stderr: string; stdout: string } | null = null;

  try {
    processedCode = await processCode(submission.language, fileName);
  } catch (error) {
    throw new AppError(
      "An error occurred during code execution.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  switch (type) {
    case "run":
      const problem = await Problem.findBySlug(submission.problem);

      if (!problem.length || !problem[0]) {
        throw new AppError(
          `The problem ${submission.problem} does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      const createSubmission = {
        user_id: user.id,
        problem_id: problem[0].id,
        code: submission.code,
        language: submission.language,
        status: "processing",
      };

      if (!isBaseSubmissionData(createSubmission)) {
        throw new AppError(`Invalid submission data.`, StatusCodes.BAD_REQUEST);
      }

      let createData: BaseSubmissionData & Partial<AdditionalSubmissionData> = {
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
          "memory_used_kb",
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

      return res
        .status(!!created ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: !!created });
    case "test":
      let data: ServerResponse | null = null;

      if (processedCode.stderr) {
        data = {
          success: false,
          message: `Code did not run successfully. ${processedCode.stderr}`,
        };
      } else {
        data = {
          success: true,
          data: processedCode.stdout,
        };
      }

      return res
        .status(
          data.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json(data);

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
  const body = req.body;

  if (typeof params !== "object" || params === null || !("param" in params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (typeof body !== "object" || body === null || !("lookup" in body)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let submission: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      submission = await Submission.findById(id);

      return res.json({ submission });
    case "user":
      const userId = parseInt(params.param);

      submission = await Submission.findByUser(userId);

      return res.json({ submission });
    case "problem":
      const problemId = parseInt(params.param);

      submission = await Submission.findByProblem(problemId);

      return res.json({ submission });
    case "status":
      const status = params.param;

      submission = await Submission.findByStatus(status);

      return res.json({ submission });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
