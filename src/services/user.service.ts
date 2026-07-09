import AppError from "@src/errors/app.error";
import type {
  BaseUserData,
  UpdateUserPayload,
} from "@src/interface/user.interface";
import User from "@src/models/user.model";
import { assignField } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

export async function getUserByLookup(
  identifier: string,
  lookup: "email",
): Promise<BaseUserData>;

export async function getUserByLookup(
  identifier: string | number,
  lookup: "id",
): Promise<BaseUserData>;

export async function getUserByLookup(
  identifier: string | number,
  lookup: string,
): Promise<BaseUserData> {
  let user: BaseUserData[] | null = null;

  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      user = (await User.findById(id)) as BaseUserData[];

      if (!user || !user[0]) {
        throw new AppError(`User does not exist.`, StatusCodes.NOT_FOUND);
      }

      return user[0];

    case "email":
      if (typeof identifier !== "string") {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      user = (await User.findByEmail(identifier)) as BaseUserData[];

      if (!user || !user[0]) {
        throw new AppError(`User does not exist.`, StatusCodes.NOT_FOUND);
      }

      return user[0];

    default:
      throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }
}

export function buildUpdateUserPayload(data: UpdateUserPayload) {
  const payload: UpdateUserPayload = {};

  const FIELDS: (keyof UpdateUserPayload)[] = [
    "first_name",
    "image",
    "is_verified",
    "last_name",
    "password",
    "problems_solved",
    "total_submissions",
    "username",
  ];

  for (const field of FIELDS) {
    const value = data[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export function buildChangePasswordPayload(password: string) {
  const payload = {
    password: password,
  };

  return payload;
}
