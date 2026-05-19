import AppError from "@src/errors/app.error";
import {
  isValidCreateHintPayload,
  isValidUpdateHintPayload,
} from "@src/guard/hint.guard";
import type { BaseHintData } from "@src/interface/hint.interface";
import type { BaseProblemData } from "@src/interface/problem.interface";
import Hint from "@src/models/hint.model";
import Problem from "@src/models/problem.model";
import { buildHintPayload, getHintByLookup } from "@src/services/hint.service";
import { getProblemByLookup } from "@src/services/problem.service";
import {
  isValidIdentifierParam,
  isValidIdParam,
  isValidLookupQuery,
  isValidObject,
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

  if (isValidObject(query) && isValidString(query.problem)) {
    slug = query.problem;
  }

  const mappedHints = new Map<string, BaseHintData[]>();

  if (slug) {
    const problem = await getProblemByLookup(slug, "slug");

    const hints = (await Hint.findByProblem(problem.id)) as BaseHintData[];

    mappedHints.set(problem.slug, hints);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { hints: Object.fromEntries(mappedHints) },
    });
  } else {
    const problems = (await Problem.all()) as BaseProblemData[];

    for (const p of problems) {
      const hint = (await Hint.findByProblem(p.id)) as BaseHintData[];

      mappedHints.set(p.slug, hint);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { hints: Object.fromEntries(mappedHints) },
    });
  }
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

  const hint = await getHintByLookup(params.identifier, query.lookup);

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

  const updateData = buildHintPayload(hintPayload, "partial");

  const updated = await Hint.update(hint.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
