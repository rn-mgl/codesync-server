import type { BaseUserData } from "@/src/interface/user-interface";
import User from "@/src/models/User";
import { hashString } from "@/src/utils/crypt-utils";
import type { Request, Response } from "express";
import AppError from "@/errors/AppError";
import { StatusCodes } from "http-status-codes";

const isCreateUserData = (data: any): data is BaseUserData => {
  const REQUIRED_FIELDS: (keyof BaseUserData)[] = [
    "first_name",
    "last_name",
    "username",
    "email",
    "password",
  ];

  return REQUIRED_FIELDS.every(
    (field) => typeof data[field] === "string" && data[field]
  );
};

export const create = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data || !isCreateUserData(data)) {
    throw new AppError(
      `Please fill out the required fields.`,
      StatusCodes.BAD_REQUEST
    );
  }

  const { first_name, last_name, username, email, password } = data;

  const hashed = await hashString(password);

  const created = User.create(first_name, last_name, username, email, hashed);

  return res.json({ success: created });
};
