import AppError from "@src/errors/app.error";
import type {
  AdditionalUserProgressData,
  BaseUserProgressData,
  FullUserProgressData,
} from "@src/interface/user.interface";
import UserProgress from "@src/models/user-progress.model";
import {
  assignField,
  isAdditionalUserProgressData,
  isBaseUserProgressData,
  isValidLookupQuery,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseUserProgressData(body)) {
    throw new AppError(`Invalid progress data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseUserProgressData & Partial<AdditionalUserProgressData> = {
    progress_data: body.progress_data,
    user_id: body.user_id,
  };

  if (isAdditionalUserProgressData(body, "partial")) {
    const FIELDS: (keyof AdditionalUserProgressData)[] = [
      "problems_solved_today",
      "streak_days",
      "submissions_made",
      "time_spent_seconds",
    ] as const;

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalUserProgressData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await UserProgress.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupParam(params) || !isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let progress: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.param);

      progress = await UserProgress.findById(id);

      return res.json({ progress });

    case "user":
      const user = parseInt(params.param);

      progress = await UserProgress.findByUser(user);

      return res.json({ progress });

    case "date":
      const date = params.param;

      progress = await UserProgress.findByDate(date);

      return res.json({ progress });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (
    !isBaseUserProgressData(body, "partial") &&
    !isAdditionalUserProgressData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullUserProgressData> = {};

  if (isBaseUserProgressData(body, "partial")) {
    const FIELDS: (keyof BaseUserProgressData)[] = ["progress_data", "user_id"];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseUserProgressData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalUserProgressData(body, "partial")) {
    const FIELDS: (keyof AdditionalUserProgressData)[] = [
      "problems_solved_today",
      "streak_days",
      "submissions_made",
      "time_spent_seconds",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalUserProgressData];

      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const userProgressId = Number(params.identifier);

  if (Number.isNaN(userProgressId)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const userProgress = (await UserProgress.findById(
    userProgressId,
  )) as FullUserProgressData[];

  if (!userProgress || !userProgress[0]) {
    throw new AppError(
      `The record you are trying to update does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const updated = await UserProgress.update(userProgressId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
