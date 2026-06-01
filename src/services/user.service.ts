import AppError from "@src/errors/app.error";
import type { BaseUserData } from "@src/interface/user.interface";
import User from "@src/models/user.model";
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
