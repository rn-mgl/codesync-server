import AppError from "@src/errors/app.error";
import { isValidCreateHintPayload } from "@src/guard/hint.guard";
import type {
  AdditionalHintData,
  BaseHintData,
} from "@src/interface/hint.interface";
import Hint from "@src/models/hint.model";
import { buildHintPayload } from "@src/services/hint.service";
import { getProblemByLookup } from "@src/services/problem.service";
import {
  assignField,
  isAdditionalHintData,
  isBaseHintData,
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid hint request.`, StatusCodes.BAD_REQUEST);
  }

  if (!("hint" in body) || !isValidObject(body.hint)) {
    throw new AppError(`Invalid hint data.`, StatusCodes.BAD_REQUEST);
  }

  const hint = body.hint;

  if (!isValidCreateHintPayload(hint)) {
    throw new AppError(`Invalid hint payload.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(hint.problem, "slug");

  const createPaylod = buildHintPayload({ ...hint, problem_id: problem.id });

  const created = await Hint.create(createPaylod);

  if (!created) {
    throw new AppError(
      `An error occurred during hint creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: `Hint created successfully.` } });
};

export const all = async (req: Request, res: Response) => {
  const hints = await Hint.all();

  return res.json({ hints });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let hint: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      hint = await Hint.findById(id);

      return res.json({ hint });
    case "problem":
      const problem = parseInt(params.identifier);

      hint = await Hint.findByProblem(problem);

      return res.json({ hint });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseHintData(body) && !isAdditionalHintData(body)) {
    throw new AppError(`Invalid update data.`, StatusCodes.BAD_REQUEST);
  }

  const updateData: Partial<BaseHintData & AdditionalHintData> = {};

  if (isBaseHintData(body, "partial")) {
    const FIELDS: (keyof BaseHintData)[] = ["level", "hint", "problem_id"];

    for (const field of FIELDS) {
      const value = body[field];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalHintData(body, "partial")) {
    const FIELDS: (keyof AdditionalHintData)[] = ["order_index"];

    for (const field of FIELDS) {
      const value = body[field];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Hint.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
