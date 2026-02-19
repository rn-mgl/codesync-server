import AppError from "@errors/app.error";
import User from "@models/user.model";
import {
  accountVerificationEmail,
  passwordResetMail,
} from "@src/services/email.service";
import { isBaseUserData } from "@src/utils/type.util";
import { hashString, verifyHash } from "@utils/crypt.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("credentials" in body)) {
    throw new AppError(
      "Please fill out email and password.",
      StatusCodes.BAD_GATEWAY,
    );
  }

  const { credentials } = body;

  if (!("email" in credentials) || !("password" in credentials)) {
    throw new AppError(
      "Please fill out email and password.",
      StatusCodes.BAD_GATEWAY,
    );
  }

  const { email: candidateEmail, password: candidatePassword } = credentials;

  if (!candidateEmail || !candidatePassword) {
    throw new AppError(
      "Please fill out email and password.",
      StatusCodes.BAD_GATEWAY,
    );
  }

  const user = await User.findByEmail(candidateEmail);

  if (!user || !user[0]) {
    throw new AppError(
      `The email you entered is invalid.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const { id, first_name, last_name, username, email, password, is_verified } =
    user[0];

  const isCorrectPassword = await verifyHash(candidatePassword, password);

  if (!isCorrectPassword) {
    throw new AppError(
      `The email and password does not match.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  let token: string | null = null;

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `No Auth Algorithm applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!is_verified) {
    if (!process.env.JWT_REGISTER_TOKEN) {
      throw new AppError(
        `No Register Token applied.`,
        StatusCodes.FAILED_DEPENDENCY,
      );
    }

    if (!process.env.JWT_REGISTER_TTL) {
      throw new AppError(
        `No Expiration applied.`,
        StatusCodes.FAILED_DEPENDENCY,
      );
    }

    const secret = process.env.JWT_REGISTER_TOKEN;
    const algorithm = process.env.JWT_AUTH_ALGO as jwt.Algorithm;
    const expiresIn = process.env.JWT_REGISTER_TTL as string;

    const options = { algorithm, expiresIn } as jwt.SignOptions;

    token = jwt.sign(
      { first_name, last_name, email, username },
      secret,
      options,
    );

    const sendVerification = await accountVerificationEmail(email, token);
  } else {
    if (!process.env.JWT_LOGIN_TOKEN) {
      throw new AppError(
        `No Auth Token applied.`,
        StatusCodes.FAILED_DEPENDENCY,
      );
    }

    if (!process.env.JWT_LOGIN_TTL) {
      throw new AppError(
        `No Expiration applied.`,
        StatusCodes.FAILED_DEPENDENCY,
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
  const body = req.body;

  if (!("credentials" in body)) {
    throw new AppError(
      "Please fill out the required fields.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const { credentials } = body;

  if (!credentials || !isBaseUserData(credentials)) {
    throw new AppError(
      "Please fill out the required fields.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const { email, first_name, last_name, password, username } = credentials;

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
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!process.env.JWT_REGISTER_TOKEN) {
    throw new AppError(
      `No register token applied`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `No Auth Algorithm applied`,
      StatusCodes.FAILED_DEPENDENCY,
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
    options,
  );

  const sendVerification = await accountVerificationEmail(email, token);

  return res.json({ success: true, token });
};

export const verify = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("token" in body)) {
    throw new AppError(
      `No authentication token passed.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { token } = body;

  if (!process.env.JWT_REGISTER_TOKEN) {
    throw new AppError(
      `No register token applied.`,
      StatusCodes.FAILED_DEPENDENCY,
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

  const verified = await User.update(user[0].id, {
    is_verified: true,
  });

  if (!verified) {
    throw new AppError(
      `An error occurred during verification.`,
      StatusCodes.FORBIDDEN,
    );
  }

  return res.json({ verified: !!verified });
};

export const forgot = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("credentials" in body)) {
    throw new AppError(
      `Please fill out all required fields.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { credentials } = body;

  if (!("username" in credentials) || !("email" in credentials)) {
    throw new AppError(
      `Please fill out all required fields.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { username: candidateUsername, email: candidateEmail } = credentials;

  const user = await User.find({
    username: candidateUsername,
    email: candidateEmail,
  });

  if (!user.length || !user[0]) {
    throw new AppError(
      `The credentials you entered does not match any user.`,
      StatusCodes.NOT_FOUND,
    );
  }

  if (!isBaseUserData(user[0], "full")) {
    throw new AppError(
      `The retrieved user is not valid.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { email, first_name, last_name, username } = user[0];

  if (!process.env.JWT_RESET_TOKEN) {
    throw new AppError(
      `No reset token applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!process.env.JWT_RESET_TTL) {
    throw new AppError(
      `No reset token expiration applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `No token algorithm applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const options = {
    algorithm: process.env.JWT_AUTH_ALGO,
    expiresIn: process.env.JWT_RESET_TTL,
  } as jwt.SignOptions;

  const token = jwt.sign(
    { email, first_name, last_name, username },
    process.env.JWT_RESET_TOKEN,
    options,
  );

  const sendPasswordReset = await passwordResetMail(email, token);

  return res.status(StatusCodes.OK).json({ success: !!sendPasswordReset });
};

export const reset = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("credentials" in body) || !("token" in body)) {
    throw new AppError(
      `Please fill out the required fields.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { credentials, token } = body;

  if (!("password" in credentials) || !("confirm_password" in credentials)) {
    throw new AppError(
      `Please fill out the required fields.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { password, confirm_password } = credentials;

  if (password !== confirm_password) {
    throw new AppError(
      `Password confirmation does not match.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!process.env.JWT_RESET_TOKEN) {
    throw new AppError(
      `There is no reset token applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!process.env.JWT_AUTH_ALGO) {
    throw new AppError(
      `There is no token algorithm applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  if (!process.env.JWT_RESET_TTL) {
    throw new AppError(
      `There is no reset token expiration applied.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const options = {
    algorithm: process.env.JWT_AUTH_ALGO,
  } as jwt.VerifyOptions;

  const decoded = jwt.verify(token, process.env.JWT_RESET_TOKEN, options);

  if (typeof decoded !== "object" || !("email" in decoded)) {
    throw new AppError(`Invalid token provided.`, StatusCodes.FORBIDDEN);
  }

  const { email } = decoded;

  const user = await User.findByEmail(email);

  if (!user.length || !user[0]) {
    throw new AppError(
      `There is no user found using the token.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const encrypted = await hashString(password);

  const updated = await User.update(user[0].id, { password: encrypted });

  if (!updated) {
    throw new AppError(
      `An error occurred during password update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({ success: !!updated });
};
