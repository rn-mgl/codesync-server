import AppError from "@errors/AppError.ts";
import User from "@models/User.ts";
import { accountVerificationEmail } from "@src/services/email-service";
import { isBaseUserData } from "@src/utils/type-utils";
import { hashString, verifyHash } from "@utils/crypt-utils";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { candidateEmail, candidatePassword } = req.body;

  if (!candidateEmail || !candidatePassword) {
    throw new AppError(
      "Please fill out email and password.",
      StatusCodes.BAD_GATEWAY
    );
  }

  const user = await User.findByEmail(candidateEmail);

  if (!user || !user[0]) {
    throw new AppError(
      `The email you entered is invalid.`,
      StatusCodes.NOT_FOUND
    );
  }

  const { id, first_name, last_name, username, email, password, is_verified } =
    user[0];

  const isCorrectPassword = await verifyHash(candidatePassword, password);

  if (!isCorrectPassword) {
    throw new AppError(
      `The email and password does not match.`,
      StatusCodes.UNAUTHORIZED
    );
  }

  let token: string | null = null;

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `No Auth Algorithm applied.`,
      StatusCodes.FAILED_DEPENDENCY
    );
  }

  if (!is_verified) {
    if (!process.env.JWT_REGISTER_TOKEN) {
      throw new AppError(
        `No Register Token applied.`,
        StatusCodes.FAILED_DEPENDENCY
      );
    }

    if (!process.env.JWT_REGISTER_TTL) {
      throw new AppError(
        `No Expiration applied.`,
        StatusCodes.FAILED_DEPENDENCY
      );
    }

    const secret = process.env.JWT_REGISTER_TOKEN;
    const algorithm = process.env.JWT_AUTH_ALGO as jwt.Algorithm;
    const expiresIn = process.env.JWT_REGISTER_TTL as string;

    const options = { algorithm, expiresIn } as jwt.SignOptions;

    token = jwt.sign(
      { first_name, last_name, email, username },
      secret,
      options
    );

    const sendVerification = await accountVerificationEmail(email, token);
  } else {
    if (!process.env.JWT_LOGIN_TOKEN) {
      throw new AppError(
        `No Auth Token applied.`,
        StatusCodes.FAILED_DEPENDENCY
      );
    }

    if (!process.env.JWT_LOGIN_TTL) {
      throw new AppError(
        `No Expiration applied.`,
        StatusCodes.FAILED_DEPENDENCY
      );
    }

    const secret = process.env.JWT_LOGIN_TOKEN;
    const algorithm = process.env.JWT_AUTH_ALGO as jwt.Algorithm;
    const expiresIn = process.env.JWT_LOGIN_TTL as string;

    const options = { algorithm, expiresIn } as jwt.SignOptions;

    token = jwt.sign({ id, email, password }, secret, options);
  }

  return res.json({ token, user: { id, is_verified } });
};

export const register = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data || !isBaseUserData(data)) {
    throw new AppError(
      "Please fill out the required fields.",
      StatusCodes.BAD_REQUEST
    );
  }

  const { email, first_name, last_name, password, username } = data;

  const hashedString = await hashString(password);

  const userData = {
    first_name,
    last_name,
    username,
    email,
    password: hashedString,
  };

  const user = await User.create(userData);

  if (!user) {
    throw new AppError(
      `An error occurred when creating your account.`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (!process.env.JWT_REGISTER_TOKEN) {
    throw new AppError(
      `No register token applied`,
      StatusCodes.FAILED_DEPENDENCY
    );
  }

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `No Auth Algorithm applied`,
      StatusCodes.FAILED_DEPENDENCY
    );
  }

  if (!process.env.JWT_REGISTER_TTL) {
    throw new AppError(`No Expiration applied.`, StatusCodes.FAILED_DEPENDENCY);
  }

  const secret = process.env.JWT_REGISTER_TOKEN;
  const algorithm = process.env.JWT_AUTH_ALGO as jwt.Algorithm;
  const expiresIn = process.env.JWT_REGISTER_TTL as string;

  const options = { algorithm, expiresIn } as jwt.SignOptions;

  const token = jwt.sign(
    { first_name, last_name, username, email },
    secret,
    options
  );

  const sendVerification = await accountVerificationEmail(email, token);

  return res.json({ success: true, token });
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError(
      `No authentication token passed.`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (!process.env.JWT_REGISTER_TOKEN) {
    throw new AppError(
      `No register token applied.`,
      StatusCodes.FAILED_DEPENDENCY
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_REGISTER_TOKEN);

  if (typeof decoded !== "object" || !("email" in decoded)) {
    throw new AppError(`Invalid token provided`, StatusCodes.FORBIDDEN);
  }

  const { email } = decoded;

  const user = await User.findByEmail(email);

  if (!user || !user[0]) {
    throw new AppError(`Invalid token provided`, StatusCodes.FORBIDDEN);
  }

  const verified = await User.updateById(user[0].id, { is_verified: true });

  if (!verified) {
    throw new AppError(
      `An error occurred during verification.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ verified: !!verified });
};
