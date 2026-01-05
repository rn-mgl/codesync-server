import AppError from "@src/errors/AppError";
import type {
  AdditionalUserProgressData,
  BaseUserProgressData,
  FullUserProgressData,
} from "@src/interface/userInterface";
import UserProgress from "@src/models/UserProgress";
import {
  isAdditionalUserProgressData,
  isBaseUserProgressData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
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
      if (field in body && body[field as keyof object]) {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await UserProgress.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.BAD_REQUEST
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidLookupParam(params) || !isValidLookupBody(body)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let progress: RowDataPacket[] | null = null;

  switch (body.lookup) {
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
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
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
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await UserProgress.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
