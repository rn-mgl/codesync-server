import AppError from "@src/errors/app.error";
import { type NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

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

  if (!process.env.APP_URL) {
    throw new AppError(
      `Missing dependency: App URL`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!header.origin || header.origin !== process.env.APP_URL) {
    throw new AppError(
      `You are not authorized to proceed with this request.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const [_, token] = header.authorization.split(" ");

  if (!token) {
    throw new AppError(
      `You are not authorized to proceed with this request.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  if (!process.env.JWT_LOGIN_TOKEN) {
    throw new AppError(
      `Missing dependency: Login Token`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const verified = jwt.verify(token, process.env.JWT_LOGIN_TOKEN);

  if (!verified) {
    throw new AppError(
      `Your log in token has expired. Please log in again.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  req.app.set("user", verified);

  next();
};
