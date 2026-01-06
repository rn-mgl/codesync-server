import AppError from "@src/errors/AppError";
import type { BaseUserAchievementData } from "@src/interface/userInterface";
import UserAchievement from "@src/models/UserAchievement";
import {
  isBaseUserAchievementData,
  isValidDestroyParam,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseUserAchievementData(body)) {
    throw new AppError(
      `Invalid user achievement data.`,
      StatusCodes.BAD_REQUEST
    );
  }

  const createData: BaseUserAchievementData = {
    achievement_id: body.achievement_id,
    user_id: body.user_id,
  };

  const created = await UserAchievement.create(createData);

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

  let userAchievement: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      userAchievement = await UserAchievement.findById(id);

      return res.json({ user_achievement: userAchievement });

    case "user":
      const user = parseInt(params.param);

      userAchievement = await UserAchievement.findByUser(user);

      return res.json({ user_achievement: userAchievement });

    case "achievement":
      const achievement = parseInt(params.param);

      userAchievement = await UserAchievement.findByAchievement(achievement);

      return res.json({ user_achievement: userAchievement });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidDestroyParam(params)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const id = parseInt(params.id);

  const deleted = await UserAchievement.delete(id);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.BAD_REQUEST
    );
  }

  return res.json({ success: !!deleted });
};
