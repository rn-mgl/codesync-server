import AppError from "@src/errors/app.error";
import { type NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "@src/configs/env.config";
import type { UserMiddleware } from "@src/interface/auth.interface";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers;

  if (
    !header ||
    !header.authorization ||
    !header.authorization.startsWith("Bearer ")
  ) {
    throw new AppError(
      `You are not authorized to proceed with this request.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  if (!header.origin || header.origin !== env.APP_URL) {
    throw new AppError(
      `You are not authorized to proceed with this request.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const auth = header.authorization.split(" ");

  const token = auth[1];

  if (!token) {
    throw new AppError(
      `You are not authorized to proceed with this request.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const verified = jwt.verify(token, env.JWT_LOGIN_TOKEN);

  if (!verified) {
    throw new AppError(
      `Your log in token has expired. Please log in again.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  req.user = verified as UserMiddleware;

  next();
};
