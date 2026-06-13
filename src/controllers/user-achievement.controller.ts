import AppError from "@src/errors/app.error";
import UserAchievement from "@src/models/user-achievement.model";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query) || !isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let userAchievement: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      userAchievement = await UserAchievement.findById(id);

      return res.json({ user_achievement: userAchievement });

    case "user":
      const user = parseInt(params.identifier);

      userAchievement = await UserAchievement.findByUser(user);

      return res.json({ user_achievement: userAchievement });

    case "achievement":
      const achievement = parseInt(params.identifier);

      userAchievement = await UserAchievement.findByAchievement(achievement);

      return res.json({ user_achievement: userAchievement });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
