import AppError from "@src/errors/app.error";
import { isValidProblemPayload } from "@src/guard/problem.guard";
import type { BaseTestCaseData } from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import {
  buildDeleteProblemPayload,
  buildProblemPayload,
  getProblemByLookup,
} from "@src/services/problem.service";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isValidObject(body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (body.problem === undefined) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const problemPayload = body.problem;

  if (!isValidProblemPayload(problemPayload)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const createData = buildProblemPayload(problemPayload);

  const created = await Problem.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.CREATED).json({
    success: true,
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

  if (!isValidIdentifierParam(params) || !isValidLookupQuery(query)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  const lookup = query.lookup;
  const param = params.identifier;

  const problem = await getProblemByLookup(param, lookup);

  const testCases = (await TestCase.findByProblem(problem.id, {
    is_sample: true,
  })) as BaseTestCaseData[];

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { problem: problem, testCases },
  });
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidObject(body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (body.problem === undefined) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  const problemPayload = body.problem;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidProblemPayload(problemPayload, "partial")) {
    throw new AppError(`Invalid problem data.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildProblemPayload(problemPayload, "partial");

  const slug = params.identifier;

  const problem = await getProblemByLookup(slug, "slug");

  const updated = await Problem.update(problem.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: `Problem has been updated.` },
  });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(params.identifier, query.lookup);

  const updateData = buildDeleteProblemPayload(problem.slug);

  const deleted = await Problem.update(problem.id, updateData);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: "Problem deleted successfully." },
  });
};
