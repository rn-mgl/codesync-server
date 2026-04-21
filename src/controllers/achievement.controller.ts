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
  isValidIdentifierParam,
  isValidLookupQuery,
} from "@src/utils/type.util";
import { v2 as cloudinary } from "cloudinary";
import { type Request, type Response } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;
  const file = req.file;

  if (!file?.path) {
    throw new AppError(
      `File could not be found in the server.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const uploaded = await cloudinary.uploader.upload(file.path, {
    folder: "codesync-uploads",
  });

  const unlink = fs.unlink(file.path, (e) => {
    console.log("Unlink Error: " + e);
  });

  if (!uploaded) {
    throw new AppError(
      `An error occurred during file upload.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const achievement = {
    badge_color: body.badge_color,
    category: body.category,
    description: body.description,
    icon: uploaded.secure_url,
    name: body.name,
    points: body.points,
    slug: body.slug,
    unlock_criteria: body.unlock_criteria,
  };

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

      if (!achievement.length || !achievement[0]) {
        throw new AppError(
          `The achievement you're trying to get does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return res
        .status(
          achievement ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json({
          success: !!achievement,
          data: { achievement: achievement[0] },
        });

    case "slug":
      const slug = params.identifier;

      achievement = await Achievement.findBySlug(slug);

      if (!achievement.length || !achievement[0]) {
        throw new AppError(
          `The achievement you're trying to get does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return res
        .status(
          achievement ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json({
          success: !!achievement,
          data: { achievement: achievement[0] },
        });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  const achievementPayload = {
    badge_color: body.badge_color,
    category: body.category,
    description: body.description,
    icon: body.icon,
    name: body.name,
    points: body.points,
    slug: body.slug,
    unlock_criteria: body.unlock_criteria,
  };

  const file = req.file;

  if (file?.path) {
    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "codesync-uploads",
    });

    const unlink = fs.unlink(file.path, (e) => {
      console.log(`Unlink Error : ` + e);
    });

    achievementPayload.icon = uploaded.secure_url;

    if (!uploaded) {
      throw new AppError(
        `An error occurred during upload.`,
        StatusCodes.FAILED_DEPENDENCY,
      );
    }
  }

  if (!isValidLookupQuery(body)) {
    throw new AppError(`Invalid lookup request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseAchievementData(achievementPayload, "partial")) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullAchievementData> = {};

  if (isBaseAchievementData(achievementPayload, "partial")) {
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
      const value = achievementPayload[field as keyof BaseAchievementData];

      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalAchievementData(achievementPayload, "partial")) {
    const FIELDS: (keyof AdditionalAchievementData)[] = ["deleted_at"];

    for (const field of FIELDS) {
      const value =
        achievementPayload[field as keyof AdditionalAchievementData];

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
      throw new AppError(
        `Invalid achievement record.`,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  const updated = await Achievement.update(achievementId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(updated ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      success: !!updated,
      data: { message: `${updateData.name} has been updated successfully.` },
    });
};
