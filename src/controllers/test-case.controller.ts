import AppError from "@src/errors/app.error";
import type {
  BaseProblemData,
  FullProblemData,
} from "@src/interface/problem.interface";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
  FullTestCaseData,
} from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import {
  assignField,
  isAdditionalTestCaseData,
  isBaseTestCaseData,
  isValidIdentifierParam,
  isValidIdParam,
  isValidLookupQuery,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

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
    is_sample: testCase.is_sample,
    is_hidden: testCase.is_hidden,
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

  const testCases: Map<string, FullTestCaseData[]> = new Map();

  const slug: string = typeof query.problem === "string" ? query.problem : "";

  if (slug) {
    const problem = (await Problem.findBySlug(slug)) as FullProblemData[];

    if (!problem || !problem[0]) {
      throw new AppError(
        `The problem you are looking for does not exist.`,
        StatusCodes.BAD_REQUEST,
      );
    }

    const problemTestCases = (await TestCase.findByProblem(
      problem[0].id,
    )) as FullTestCaseData[];

    testCases.set(problem[0].title, problemTestCases);
  } else {
    const problems = (await Problem.all()) as FullProblemData[];

    for (const p of problems) {
      const testCase = (await TestCase.findByProblem(
        p.id,
      )) as FullTestCaseData[];

      testCases.set(p.title, testCase);
    }
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { test_cases: Object.fromEntries(testCases) },
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

  const lookup = query.lookup;
  let testCase:
    | (FullTestCaseData & Pick<BaseProblemData, "title" | "slug">)[]
    | null = null;

  switch (lookup) {
    case "id":
      const id = parseInt(params.identifier);

      testCase = (await TestCase.findById(id)) as (FullTestCaseData &
        Pick<BaseProblemData, "title" | "slug">)[];

      if (!testCase || !testCase[0]) {
        throw new AppError(
          `The test case you are trying to find does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: { test_case: testCase[0] } });

    default:
      throw new AppError(`Invalid lookup key.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!("testCase" in body)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const { testCase } = body;

  if (!("problem" in testCase) || typeof testCase.problem !== "string") {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  const slug = testCase.problem;

  const problem = (await Problem.findBySlug(slug)) as FullProblemData[];

  if (!problem || !problem[0]) {
    throw new AppError(
      `The problem ${slug} does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  testCase.problem_id = problem[0].id;

  console.log(testCase);

  if (
    !isBaseTestCaseData(testCase, "partial") &&
    !isAdditionalTestCaseData(testCase, "partial")
  ) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseTestCaseData & AdditionalTestCaseData> = {};

  if (isBaseTestCaseData(testCase)) {
    const FIELDS: (keyof BaseTestCaseData)[] = [
      "expected_output",
      "input",
      "memory_limit_mb",
      "problem_id",
      "time_limit_ms",
    ];

    for (const field of FIELDS) {
      const value = testCase[field as keyof BaseTestCaseData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalTestCaseData(testCase)) {
    const FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

    for (const field of FIELDS) {
      const value = testCase[field as keyof AdditionalTestCaseData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const id = parseInt(params.id);

  const find = (await TestCase.findById(id)) as (FullTestCaseData &
    Pick<BaseProblemData, "title" | "slug">)[];

  if (!find || !find[0]) {
    throw new AppError(
      `The test case you are trying to update does not exist.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const updated = await TestCase.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({
    success: !!updated,
    data: { message: `Test case ${id} updated.` },
  });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const id = Number(params.id);

  if (Number.isNaN(id)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const testCase = (await TestCase.findById(id)) as FullTestCaseData[];

  if (!testCase || !testCase[0]) {
    throw new AppError(
      `The test case you are trying to delete does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const updateData = {
    deleted_at: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
  };

  const deleted = await TestCase.update(testCase[0].id, updateData);

  return res
    .status(!!deleted ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      success: !!deleted,
      data: { message: `Test case ${testCase[0].id} deleted.` },
    });
};
