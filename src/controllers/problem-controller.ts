import AppError from "@src/errors/AppError";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem-interface";
import Problem from "@src/models/Problem";
import {
  isAdditionalProblemData,
  isBaseProblemData,
} from "@src/utils/type-utils";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data || !isBaseProblemData(data)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST
    );
  }

  const { title, slug, description } = data;

  let problemData: BaseProblemData & Partial<AdditionalProblemData> = {
    title,
    slug,
    description,
  };

  if (isAdditionalProblemData(data)) {
    problemData = {
      ...problemData,
      constraints: data.constraints,
      editorial: data.editorial,
      input_format: data.input_format,
      output_format: data.output_format,
    };
  }

  const created = await Problem.create(problemData);

  return res.json({ created: !!created });
};

export const all = async (req: Request, res: Response) => {
  const problems = await Problem.all();

  return res.json({ problems });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!("param" in params)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  if (!("lookup" in body)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  const lookup = body.lookup;
  const param = params.param;
  let problem: null | RowDataPacket[] = null;

  switch (lookup) {
    case "id":
      const id = parseInt(param);

      problem = await Problem.findById(id);

      return res.json({ problem });
    case "slug":
      problem = await Problem.findBySlug(param);

      return res.json({ problem });
    default:
      throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const data = req.body;
  const { id } = req.params;

  if (!id) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    (!isBaseProblemData(data) && !isAdditionalProblemData(data))
  ) {
    throw new AppError(`Invalid problem data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseProblemData & AdditionalProblemData> = {};

  if (isBaseProblemData(data)) {
    updateData = {
      ...updateData,
      title: data.title,
      description: data.description,
      slug: data.slug,
    };
  }

  if (isAdditionalProblemData(data)) {
    updateData = {
      ...updateData,
      constraints: data.constraints,
      editorial: data.editorial,
      input_format: data.input_format,
      output_format: data.output_format,
    };
  }

  const updated = await Problem.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occured when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
