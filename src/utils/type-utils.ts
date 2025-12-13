import { type BaseUserData } from "@interface/user-interface.ts";
import AppError from "@src/errors/AppError";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem-interface";
import { StatusCodes } from "http-status-codes";

export const isBaseUserData = (data: unknown): data is BaseUserData => {
  if (typeof data !== "object" || data === null) {
    throw new AppError(`Invalid user data.`, StatusCodes.BAD_REQUEST);
  }

  const REQUIRED_FIELDS: readonly (keyof BaseUserData)[] = [
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

export const isBaseProblemData = (data: unknown): data is BaseProblemData => {
  if (typeof data !== "object" || data === null) {
    throw new AppError(`Invalid Problem data`, StatusCodes.BAD_REQUEST);
  }

  const REQUIRED_FIELDS: readonly (keyof BaseProblemData)[] = [
    "title",
    "slug",
    "description",
  ];

  return REQUIRED_FIELDS.every(
    (field) =>
      data[field as keyof object] &&
      typeof data[field as keyof object] === "string"
  );
};

export const isAdditionalProblemData = (
  data: unknown
): data is AdditionalProblemData => {
  if (typeof data !== "object" || data === null) {
    throw new AppError(`Invalid Problem data`, StatusCodes.BAD_REQUEST);
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalProblemData)[] = [
    "constraints",
    "editorial",
    "input_format",
    "output_format",
  ];

  return REQUIRED_FIELDS.every(
    (field) =>
      data[field as keyof object] &&
      typeof data[field as keyof object] === "string"
  );
};
