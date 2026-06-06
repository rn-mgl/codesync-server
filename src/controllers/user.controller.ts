import AppError from "@src/errors/app.error";
import {
  isValidChangePasswordPayload,
  isValidUpdateUserPayload,
} from "@src/guard/user.guard";
import type { UserMiddleware } from "@src/interface/auth.interface";
import type { BaseUserData } from "@src/interface/user.interface";
import User from "@src/models/user.model";
import { uploadFile } from "@src/services/cloudinary.service";
import {
  buildChangePasswordPayload,
  buildUpdateUserPayload,
  getUserByLookup,
} from "@src/services/user.service";
import { hashString, verifyHash } from "@src/utils/crypt.util";
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

  const action = body.action;

  let user: BaseUserData | null = null;

  switch (action) {
    case "user_details":
      if (!isValidUpdateUserPayload(body)) {
        throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
      }

      if (isValidObject(file) && file.path) {
        const uploaded = await uploadFile(file.path);
        body.image = uploaded.secure_url;
      }

      user = await getUserByLookup(userMiddleware.id, "id");

      const detailsPayload = buildUpdateUserPayload(body);

      const updatedDetails = await User.update(user.id, detailsPayload);

      if (!updatedDetails) {
        throw new AppError(
          `An error occurred during the update.`,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        data: { message: "Details updated successfully." },
      });
    case "change_password":
      if (!isValidChangePasswordPayload(body)) {
        throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
      }

      user = await getUserByLookup(userMiddleware.id, "id");

      const verified = await verifyHash(body.current_password, user.password);

      if (!verified) {
        throw new AppError(
          `Current password does not match with your account.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      if (body.new_password !== body.confirm_new_password) {
        throw new AppError(
          `New password does not match confirmation.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      const hashed = await hashString(body.new_password);

      const passwordPayload = buildChangePasswordPayload(hashed);

      const updatedPassword = await User.update(user.id, passwordPayload);

      if (!updatedPassword) {
        throw new AppError(
          `An error occurred during the update.`,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        data: { message: "Password updated successfully." },
      });

    default:
      throw new AppError(`Invalid action.`, StatusCodes.BAD_REQUEST);
  }
};
