import AppError from "@src/errors/app.error";
import User from "@src/models/user.model";
import { getUserByLookup } from "@src/services/user.service";
import { isValidIdParam } from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const find = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  const user = await getUserByLookup(params.id, "id");

  return res.status(StatusCodes.OK).json({ success: true, data: { user } });
};

export const update = async (req: Request, res: Response) => {};
