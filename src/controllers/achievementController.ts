import AppError from "@src/errors/AppError";
import type {
  AdditionalAchievementData,
  BaseAchievementData,
  FullAchievementData,
} from "@src/interface/achievementInterface";
import Achievement from "@src/models/Achievement";
import {
  isAdditionalAchievementData,
  isBaseAchievementData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseAchievementData(body)) {
    throw new AppError(`Invalid achievement data.`, StatusCodes.BAD_REQUEST);
  }

  const createData: BaseAchievementData = {
    badge_color: body.badge_color,
    category: body.category,
    description: body.description,
    icon: body.icon,
    name: body.name,
    points: body.points,
    slug: body.slug,
    unlock_criteria: body.unlock_criteria,
  };

  const created = await Achievement.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidLookupBody(body) || !isValidLookupParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let achievement: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      achievement = await Achievement.findById(id);

      return res.json({ achievement });

    case "slug":
      const slug = params.param;

      achievement = await Achievement.findBySlug(slug);

      return res.json({ achievement });
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

  if (!isBaseAchievementData(body, "partial")) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullAchievementData> = {};

  if (isBaseAchievementData(body, "partial")) {
    const FIELDS: (keyof BaseAchievementData)[] = [
      "badge_color",
      "category",
      "description",
      "icon",
      "name",
      "points",
      "slug",
      "unlock_criteria",
    ];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalAchievementData(body, "partial")) {
    const FIELDS: (keyof AdditionalAchievementData)[] = ["deleted_at"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Achievement.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
