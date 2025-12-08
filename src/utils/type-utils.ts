import { type BaseUserData } from "@interface/user-interface.ts";
import AppError from "@src/errors/AppError";
import { StatusCodes } from "http-status-codes";

export const isBaseUserData = (data: unknown): data is BaseUserData => {
  if (typeof data !== "object" || data === null) {
    throw new AppError(`Invalid user data.`, StatusCodes.BAD_REQUEST);
  }

  const REQUIRED_FIELDS: (keyof BaseUserData)[] = [
    "email",
    "first_name",
    "last_name",
    "password",
    "username",
  ];

  return REQUIRED_FIELDS.every(
    (field) =>
      data[field as keyof object] &&
      typeof data[field as keyof object] === "string"
  );
};
