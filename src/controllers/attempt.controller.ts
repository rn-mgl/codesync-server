import AppError from "@src/errors/app.error";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attempt.interface";
import Attempt from "@src/models/attempt.model";
import {
  assignField,
  isAdditionalAttemptData,
  isBaseAttemptData,
  isValidIdentifierParam,
  isValidLookupQuery,
} from "@src/utils/type.util";

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
      const value = body[field as keyof AdditionalAttemptData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await Attempt.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during attempt saving.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
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
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let attempt: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      attempt = await Attempt.findById(id);

      return res.json({ attempt });
    case "user":
      const user = parseInt(params.identifier);

      attempt = await Attempt.findByUser(user);

      return res.json({ attempt });

    case "problem":
      const problem = parseInt(params.identifier);

      attempt = await Attempt.findByProblem(problem);

      return res.json({ attempt });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
