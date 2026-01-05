import AppError from "@src/errors/AppError";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
  FullSubmissionData,
} from "@src/interface/submissionInterface";
import Submission from "@src/models/Submission";
import {
  isAdditionalSubmissionData,
  isBaseSubmissionData,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseSubmissionData(body)) {
    throw new AppError(`Invalid submission data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseSubmissionData & Partial<AdditionalSubmissionData> = {
    code: body.code,
    language: body.language,
    problem_id: body.problem_id,
    status: body.status,
    user_id: body.user_id,
  };

  if (isAdditionalSubmissionData(body, "partial")) {
    const FIELDS: (keyof AdditionalSubmissionData)[] = [
      "error_message",
      "execution_time_ms",
      "memory_used_kb",
      "test_results",
    ];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        createData[field as keyof object] =
          typeof body[field as keyof object] !== "undefined";
      }
    }
  }

  const created = await Submission.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during submission.`,
      StatusCodes.BAD_REQUEST
    );
  }

  return res.json({ success: !!created });
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
