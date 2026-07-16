import AppError from "@src/errors/app.error";
import { isValidTestCasePayload } from "@src/guards/test-case.guard";
import type { RecordCount } from "@src/interface/model.interface";
import TestCase from "@src/models/test-case.model";
import { getProblemByLookup } from "@src/services/problem.service";
import {
  buildTestCasePayload,
  getAllTestCases,
  getTestCaseByLookup,
  getTestCasesCount,
} from "@src/services/test-case.service";
import { getRecordCount } from "@src/utils/model.util";
import {
  isValidIdentifierParam,
  isValidIdParam,
  isValidLookupQuery,
  isValidObject,
  isValidPaginateQuery,
  isValidString,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  if (body.testCase === undefined) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const testCase = body.testCase;

  if (!isValidObject(testCase)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  if (testCase.problem === undefined) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const testCaseProblem = testCase.problem;

  if (!isValidString(testCaseProblem)) {
    throw new AppError(`Invalid test case problem.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(testCaseProblem, "slug");

  testCase.problem_id = problem.id;

  if (!isValidTestCasePayload(testCase)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const createData = buildTestCasePayload(testCase);

  const created = await TestCase.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during test case creation`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.CREATED).json({
    success: true,
    data: { message: `Test Case created.` },
  });
};

export const all = async (req: Request, res: Response) => {
  const query = req.query;

  let slug: string = "";
  let page: number = 0;
  let pages: number = 0;
  let limit: number = 10;
  let listAll: boolean = false;

  if (isValidString(query.problem)) {
    slug = query.problem;
  }

  if (isValidString(query.list_all)) {
    listAll = query.list_all === "1";
  }

  if (isValidPaginateQuery(query)) {
    page = Number(query.page);
    limit = Number(query.limit);

    const problems = (await getRecordCount(
      "problems",
      slug ? { slug } : undefined,
    )) as RecordCount;
    pages = Math.ceil(problems.count / limit);
  }

  if (listAll && slug) {
    const problem = await getProblemByLookup(slug, "slug");

    const testCase = (await getRecordCount("test_cases", {
      problem_id: problem.id,
    })) as RecordCount;

    pages = Math.ceil(testCase.count / limit);
  }

  const testCases = listAll
    ? await getAllTestCases(slug, { page, limit })
    : await getTestCasesCount(slug, { page, limit });

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { test_cases: Object.fromEntries(testCases), pagination: { pages } },
  });
};

export const find = async (req: Request, res: Response) => {
  const query = req.query;
  const params = req.params;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (query.lookup !== "id") {
    throw new AppError(`Invalid identifier`, StatusCodes.BAD_REQUEST);
  }

  const identifier = Number(params.identifier);

  if (Number.isNaN(identifier)) {
    throw new AppError(`Invalid identifier`, StatusCodes.BAD_REQUEST);
  }

  const testCase = await getTestCaseByLookup(identifier, query.lookup);

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { test_case: testCase } });
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidObject(body)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const testCasePayload = body.testCase;

  if (!isValidObject(testCasePayload)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const testCaseProblem = testCasePayload.problem;

  if (!isValidString(testCaseProblem)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(testCaseProblem, "slug");

  testCasePayload.problem_id = problem.id;

  if (!isValidTestCasePayload(testCasePayload)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const identifier = Number(params.id);

  if (Number.isNaN(identifier)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildTestCasePayload(testCasePayload);

  const testCase = await getTestCaseByLookup(identifier, "id");

  const updated = await TestCase.update(testCase.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: `Test case updated.` },
  });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const identifier = Number(params.id);

  if (Number.isNaN(identifier)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  const testCase = await getTestCaseByLookup(identifier, "id");

  const deleted = await TestCase.destroy(testCase.id);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: `Test case ${testCase.id} deleted.` },
  });
};
