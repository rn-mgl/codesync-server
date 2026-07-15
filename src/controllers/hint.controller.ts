import AppError from "@src/errors/app.error";
import {
  isValidCreateHintPayload,
  isValidUpdateHintPayload,
} from "@src/guards/hint.guard";
import type { RecordCount } from "@src/interface/model.interface";
import Hint from "@src/models/hint.model";
import {
  buildHintPayload,
  getAllHints,
  getHintByLookup,
} from "@src/services/hint.service";
import { getProblemByLookup } from "@src/services/problem.service";
import { getRecordCount } from "@src/utils/model.util";
import {
  isValidIdParam,
  isValidObject,
  isValidPaginateQuery,
  isValidString,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

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
    .status(StatusCodes.CREATED)
    .json({ success: true, data: { message: `Hint created successfully.` } });
};

export const all = async (req: Request, res: Response) => {
  const query = req.query;

  let slug: string = "";
  let page = 0;
  let pages = 0;
  let limit = 10;

  if (isValidObject(query) && isValidString(query.problem)) {
    slug = query.problem;
  }

  // paginate's only applicable if there's no slug
  if (isValidPaginateQuery(query) && !slug) {
    page = Number(query.page);
    limit = Number(query.limit);

    const problems = (await getRecordCount("problems")) as RecordCount;
    pages = Math.ceil(problems.count / limit);
  }

  const hints = await getAllHints(slug, { page, limit });

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { hints: Object.fromEntries(hints), pagination: { pages } },
  });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  const hint = await getHintByLookup(params.id, "id");

  return res.status(StatusCodes.OK).json({ success: true, data: { hint } });
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidObject(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!("hint" in body) || !isValidObject(body.hint)) {
    throw new AppError(`Invalid hint request.`, StatusCodes.BAD_REQUEST);
  }

  const hintPayload = body.hint;

  if (!isValidUpdateHintPayload(hintPayload)) {
    throw new AppError(`Invalid update data.`, StatusCodes.BAD_REQUEST);
  }

  const hint = await getHintByLookup(params.id, "id");

  const updateData = buildHintPayload(hintPayload);

  const updated = await Hint.update(hint.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: "Hint updated successfully." } });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidObject(params)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameters.`, StatusCodes.BAD_REQUEST);
  }

  const hint = await getHintByLookup(params.id, "id");

  const deleted = await Hint.destroy(hint.id);

  if (!deleted) {
    throw new AppError(
      `An error occurred during the update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: "Hint deleted successfully." } });
};
