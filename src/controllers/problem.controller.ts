import AppError from "@src/errors/app.error";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem.interface";
import Problem from "@src/models/problem.model";
import {
  assignField,
  isAdditionalProblemData,
  isBaseProblemData,
  isValidLookupQuery,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("problem" in body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { problem } = body;

  if (!isBaseProblemData(problem)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { title, slug, description, difficulty } = problem;

  let createData: BaseProblemData & Partial<AdditionalProblemData> = {
    title,
    slug,
    difficulty,
    description,
  };

  if (isAdditionalProblemData(problem, "partial")) {
    const FIELDS: (keyof AdditionalProblemData)[] = [
      "constraints",
      "editorial",
      "input_format",
      "output_format",
    ];

    for (const field of FIELDS) {
      const value = problem[field as keyof AdditionalProblemData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await Problem.create(createData);

  return res.status(StatusCodes.CREATED).json({
    success: !!created,
    data: { message: "Problem created." },
  });
};

export const all = async (req: Request, res: Response) => {
  const problems = await Problem.all();

  return res.status(StatusCodes.OK).json({ success: true, data: { problems } });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupParam(params) || !isValidLookupQuery(query)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  const lookup = query.lookup;
  const param = params.param;
  let problem: null | RowDataPacket[] = null;

  switch (lookup) {
    case "id":
      const id = parseInt(param);

      problem = await Problem.findById(id);

      if (!problem || !problem.length) {
        throw new AppError(`Problem not found.`, StatusCodes.NOT_FOUND);
      }

      return res.json({ success: !!problem, data: { problem: problem[0] } });
    case "slug":
      problem = await Problem.findBySlug(param);

      if (!problem || !problem.length) {
        throw new AppError(`Problem not found.`, StatusCodes.NOT_FOUND);
      }

      return res.json({ success: !!problem, data: { problem: problem[0] } });
    default:
      throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  if (
    !isBaseProblemData(body, "partial") &&
    !isAdditionalProblemData(body, "partial")
  ) {
    throw new AppError(`Invalid problem data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseProblemData & AdditionalProblemData> = {};

  if (isBaseProblemData(body, "partial")) {
    const FIELDS: (keyof BaseProblemData)[] = [
      "slug",
      "title",
      "description",
      "difficulty",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseProblemData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalProblemData(body, "partial")) {
    const FIELDS: (keyof AdditionalProblemData)[] = [
      "constraints",
      "editorial",
      "input_format",
      "output_format",
    ] as const;

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalProblemData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Problem.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
