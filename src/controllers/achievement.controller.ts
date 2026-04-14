import AppError from "@src/errors/app.error";
import type {
  AdditionalAchievementData,
  BaseAchievementData,
  FullAchievementData,
} from "@src/interface/achievement.interface";
import Achievement from "@src/models/achievement.model";
import {
  assignField,
  isAdditionalAchievementData,
  isBaseAchievementData,
  isValidLookupQuery,
  isValidIdentifierParam,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("achievement" in body)) {
    throw new AppError(`Invalid achievement data.`, StatusCodes.BAD_REQUEST);
  }

  const { achievement } = body;

  if (!isBaseAchievementData(achievement)) {
    throw new AppError(`Invalid achievement data.`, StatusCodes.BAD_REQUEST);
  }

  const createData: BaseAchievementData = {
    badge_color: achievement.badge_color,
    category: achievement.category,
    description: achievement.description,
    icon: achievement.icon,
    name: achievement.name,
    points: achievement.points,
    slug: achievement.slug,
    unlock_criteria: achievement.unlock_criteria,
  };

  const created = await Achievement.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({
    success: !!created,
    data: { message: `${createData.name} created successfully.` },
  });
};

export const all = async (req: Request, res: Response) => {
  const achievements = await Achievement.all();

  return res
    .status(achievements ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ success: !!achievements, data: { achievements } });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query) || !isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let achievement: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      achievement = await Achievement.findById(id);

      return res.json({ achievement });

    case "slug":
      const slug = params.identifier;

      achievement = await Achievement.findBySlug(slug);

      return res.json({ achievement });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidLookupQuery(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
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
      const value = body[field as keyof BaseAchievementData];

      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalAchievementData(body, "partial")) {
    const FIELDS: (keyof AdditionalAchievementData)[] = ["deleted_at"];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalAchievementData];

      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  let achievementId: number;

  if (body.lookup === "slug") {
    const achievement = (await Achievement.findBySlug(
      params.identifier,
    )) as FullAchievementData[];

    if (!achievement || !achievement[0]) {
      throw new AppError(
        `The record you are trying to update does not exist.`,
        StatusCodes.NOT_FOUND,
      );
    }

    achievementId = achievement[0].id;
  } else {
    achievementId = Number(params.identifier);

    if (Number.isNaN(achievementId)) {
      throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
    }
  }

  const updated = await Achievement.update(achievementId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
