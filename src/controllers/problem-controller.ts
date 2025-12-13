import Problem from "@src/models/Problem";
import { StatusCodes } from "http-status-codes";
import { type Request, type Response } from "express";
import {
  isAdditionalProblemData,
  isBaseProblemData,
} from "@src/utils/type-utils";
import AppError from "@src/errors/AppError";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem-interface";

export const create = async (req: Request, res: Response) => {
  const data = req.body;

  console.log(data);

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
