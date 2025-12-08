import AppError from "@errors/AppError.ts";
import User from "@models/User.ts";
import { verifyHash } from "@utils/crypt-utils";
import { response, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { candidateEmail, candidatePassword } = req.body;

  const user = await User.findByEmail(candidateEmail);

  if (!user || !user[0]) {
    throw new AppError(
      `The email you entered is invalid.`,
      StatusCodes.NOT_FOUND
    );
  }

  const { user_id, email, password } = user[0];

  const isCorrectPassword = await verifyHash(candidatePassword, password);

  if (!isCorrectPassword) {
    throw new AppError(
      `The email and password does not match.`,
      StatusCodes.UNAUTHORIZED
    );
  }

  if (!process.env.AUTH_TOKEN) {
    throw new AppError(`No Auth Token applied.`, StatusCodes.FAILED_DEPENDENCY);
  }

  const token = jwt.sign(
    { user_id, email, password },
    process.env.AUTH_TOKEN!,
    { algorithm: "ES256" }
  );

  return response.json({ token });
};
