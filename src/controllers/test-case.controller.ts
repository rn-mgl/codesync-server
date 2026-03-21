import AppError from "@src/errors/app.error";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
} from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import {
  assignField,
  isAdditionalTestCaseData,
  isBaseTestCaseData,
  isValidLookupParam,
  isValidLookupQuery,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("testCase" in body)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const { testCase } = body;

  if (!("problem" in testCase)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const problem = (await Problem.findBySlug(
    testCase.problem,
  )) as FullProblemData[];

  if (!problem || !problem[0]) {
    throw new AppError(
      `The problem you are connecting to does not exist.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  testCase.problem_id = problem[0].id;

  if (!isBaseTestCaseData(testCase)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseTestCaseData & Partial<AdditionalTestCaseData> = {
    input: testCase.input,
    expected_output: testCase.expected_output,
    memory_limit_mb: testCase.memory_limit_mb,
    problem_id: testCase.problem_id,
    time_limit_ms: testCase.time_limit_ms,
  };

  if (isAdditionalTestCaseData(testCase, "partial")) {
    const FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

    for (const field of FIELDS) {
      const value = testCase[field as keyof AdditionalTestCaseData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await TestCase.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during test case creation`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({
    success: !!created,
    data: { message: `Test Case for ${problem[0].title} created.` },
  });
};

export const all = async (req: Request, res: Response) => {
  const query = req.query;

  let testCases: RowDataPacket[] = [];

  const slug: string = typeof query.problem === "string" ? query.problem : "";

  if (slug) {
    const problem = (await Problem.findBySlug(slug)) as FullProblemData[];

    if (!problem || !problem[0]) {
      throw new AppError(
        `The problem you are looking for does not exist.`,
        StatusCodes.BAD_REQUEST,
      );
    }

    testCases = await TestCase.findByProblem(problem[0].id);
  } else {
    testCases = await TestCase.all();
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { test_cases: testCases } });
};

export const find = async (req: Request, res: Response) => {
  const query = req.query;
  const params = req.params;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  const lookup = query.lookup;
  let testCase: RowDataPacket[] | null = null;

  switch (lookup) {
    case "id":
      const id = parseInt(params.param);

      testCase = await TestCase.findById(id);

      return res.json({ test_case: testCase });
    case "problem":
      const problem = parseInt(params.param);

      testCase = await TestCase.findByProblem(problem);

      return res.json({ test_case: testCase });

    default:
      throw new AppError(`Invalid lookup key.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (
    !isBaseTestCaseData(body, "partial") &&
    !isAdditionalTestCaseData(body, "partial")
  ) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid test case update.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseTestCaseData & AdditionalTestCaseData> = {};

  if (isBaseTestCaseData(body)) {
    const FIELDS: (keyof BaseTestCaseData)[] = [
      "expected_output",
      "input",
      "memory_limit_mb",
      "problem_id",
      "time_limit_ms",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseTestCaseData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalTestCaseData(body)) {
    const FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalTestCaseData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await TestCase.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
