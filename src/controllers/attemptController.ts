import AppError from "@src/errors/AppError";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attemptInterface";
import Attempt from "@src/models/Attempt";
import {
  isAdditionalAttemptData,
  isBaseAttemptData,
} from "@src/utils/typeUtil";

import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseAttemptData(body)) {
    throw new AppError(`Invalid attempt data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseAttemptData & Partial<AdditionalAttemptData> = {
    attempt_count: body.attempt_count,
    hints_used: body.hints_used,
    problem_id: body.problem_id,
    time_spent_seconds: body.time_spent_seconds,
    user_id: body.user_id,
  };

  if (isAdditionalAttemptData(body, "partial")) {
    const FIELDS: (keyof AdditionalAttemptData)[] = ["is_solved"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await Attempt.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during attempt saving.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const all = async (req: Request, res: Response) => {
  const attempts = await Attempt.all();

  return res.json({ attempts });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("param" in params)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (typeof body !== "object" || body === null || !("lookup" in body)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let attempt: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      attempt = await Attempt.findById(id);

      return res.json({ attempt });
    case "user":
      const user = parseInt(params.param);

      attempt = await Attempt.findByUser(user);

      return res.json({ attempt });

    case "problem":
      const problem = parseInt(params.param);

      attempt = await Attempt.findByProblem(problem);

      return res.json({ attempt });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
