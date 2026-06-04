import AppError from "@src/errors/app.error";
import { isValidUpdateUserPayload } from "@src/guard/user.guard";
import type { UserMiddleware } from "@src/interface/auth.interface";
import User from "@src/models/user.model";
import { uploadFile } from "@src/services/cloudinary.service";
import { getUserByLookup } from "@src/services/user.service";
import { isValidIdParam, isValidObject } from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const userMiddleware = req.app.get("user") as UserMiddleware;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  if (userMiddleware.id !== Number(params.id)) {
    throw new AppError(
      `You are not allowed to access this user.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const user = await getUserByLookup(params.id, "id");

  return res.status(StatusCodes.OK).json({ success: true, data: { user } });
};

export const update = async (req: Request, res: Response) => {
  const file = req.file;
  const body = req.body;
  const params = req.params;
  const userMiddleware = req.app.get("user") as UserMiddleware;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  if (userMiddleware.id !== Number(params.id)) {
    throw new AppError(
      `You are not allowed to access this user.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!isValidObject(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidUpdateUserPayload(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (isValidObject(file) && file.path) {
    const uploaded = await uploadFile(file.path);
    body.image = uploaded.secure_url;
  }

  const user = await getUserByLookup(userMiddleware.id, "id");

  const updated = await User.update(user.id, body);

  if (!updated) {
    throw new AppError(
      `An error occurred during the update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: "Details updated successfully." },
  });
};
