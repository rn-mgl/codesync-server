import AppError from "@src/errors/app.error";
import { isValidAchievementPayload } from "@src/guards/achievement.guard";
import Achievement from "@src/models/achievement.model";
import {
  buildAchievementPayload,
  getAchievementByLookup,
  getAllAchievements,
} from "@src/services/achievement.service";
import { uploadFile } from "@src/services/cloudinary.service";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
  isValidString,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;
  const file = req.file;

  if (!isValidObject(file)) {
    throw new AppError(
      `File could not be found in the server.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!isValidObject(body)) {
    throw new AppError(`Invalid achievement data.`, StatusCodes.BAD_REQUEST);
  }

  if (!file?.path) {
    throw new AppError(
      `File could not be found in the server.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const uploaded = await uploadFile(file.path);

  // need to hand pick fields because details are passed as form data instead of nested json
  const achievementPayload = {
    badge_color: body.badge_color,
    category: body.category,
    description: body.description,
    icon: uploaded.secure_url,
    name: body.name,
    points: body.points,
    slug: body.slug,
    unlock_criteria: body.unlock_criteria,
  };

  if (!isValidAchievementPayload(achievementPayload)) {
    throw new AppError(`Invalid achievement data.`, StatusCodes.BAD_REQUEST);
  }

  const createData = buildAchievementPayload(achievementPayload);

  const created = await Achievement.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.CREATED).json({
    success: true,
    data: { message: `${createData.name} created successfully.` },
  });
};

export const all = async (req: Request, res: Response) => {
  const achievements = await getAllAchievements();

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { achievements } });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  const achievement = await getAchievementByLookup(
    params.identifier,
    query.lookup,
  );

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { achievement } });
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;
  const file = req.file;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  // if there's no url for the icon and there's no new raw file
  if (!isValidString(body.icon) && !isValidObject(file)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(body)) {
    throw new AppError(`Invalid lookup request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  if (file?.path) {
    const uploaded = await uploadFile(file.path);

    body.icon = uploaded.secure_url;
  }

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

  if (!isValidAchievementPayload(achievementPayload, "partial")) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildAchievementPayload(achievementPayload);

  const achievement = await getAchievementByLookup(
    params.identifier,
    body.lookup,
  );

  const updated = await Achievement.update(achievement.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: `${updateData.name} has been updated successfully.` },
  });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  const achievement = await getAchievementByLookup(
    params.identifier,
    query.lookup,
  );

  const deleted = await Achievement.destroy(achievement.id);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: {
      message: `Achievement has been deleted successfully.`,
    },
  });
};
