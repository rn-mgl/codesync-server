import AppError from "@src/errors/AppError";
import type {
  AdditionalProgressData,
  BaseProgressData,
  FullProgressData,
} from "@src/interface/progressInterface";
import Progress from "@src/models/Progress";
import {
  isAdditionalProgressData,
  isBaseProblemData,
  isBaseProgressData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseProgressData(body)) {
    throw new AppError(`Invalid progress data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseProgressData & Partial<AdditionalProgressData> = {
    progress_data: body.progress_data,
    user_id: body.user_id,
  };

  if (isAdditionalProgressData(body, "partial")) {
    const FIELDS: (keyof AdditionalProgressData)[] = [
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

  const created = await Progress.create(createData);

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

      progress = await Progress.findById(id);

      return res.json({ progress });

    case "user":
      const user = parseInt(params.param);

      progress = await Progress.findByUser(user);

      return res.json({ progress });

    case "date":
      const date = params.param;

      progress = await Progress.findByDate(date);

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
    !isBaseProgressData(body, "partial") &&
    !isAdditionalProgressData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullProgressData> = {};

  if (isBaseProgressData(body, "partial")) {
    const FIELDS: (keyof BaseProgressData)[] = ["progress_data", "user_id"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalProgressData(body, "partial")) {
    const FIELDS: (keyof AdditionalProgressData)[] = [
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
  const updated = await Progress.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
