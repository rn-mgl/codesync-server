import AppError from "@src/errors/app.error";
import type { BaseCodyData } from "@src/interface/cody.interface";
import Cody from "@src/models/cody.model";
import { StatusCodes } from "http-status-codes";

export async function getCodyByLookup(identifier: string, lookup: string) {
  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid parameters.`, StatusCodes.BAD_REQUEST);
      }

      const records = (await Cody.findById(id)) as BaseCodyData[];

      if (!records || !records[0]) {
        throw new AppError(
          `The session could not be found.`,
          StatusCodes.NOT_FOUND,
        );
      }

      const cody = records[0];

      return cody;

    default:
      throw new AppError(`Invalid lookup type.`, StatusCodes.BAD_REQUEST);
  }
}
