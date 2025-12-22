import AppError from "@src/errors/AppError";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
} from "@src/interface/testCaseInterface";
import TestCase from "@src/models/TestCase";
import {
  isAdditionalTestCaseData,
  isBaseTestCaseData,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseTestCaseData(body)) {
    throw new AppError(`Invalid test case data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseTestCaseData & Partial<AdditionalTestCaseData> = {
    input: body.input,
    expected_output: body.expected_output,
    memory_limit_mb: body.memory_limit_mb,
    problem_id: body.problem_id,
    time_limit_ms: body.time_limit_ms,
  };

  if (isAdditionalTestCaseData(body, "partial")) {
    const FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await TestCase.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during test case creation`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const all = async (req: Request, res: Response) => {
  const testCases = await TestCase.all();

  return res.json({ test_cases: testCases });
};

export const find = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (typeof body !== "object" || body === null || !("lookup" in body)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (typeof params !== "object" || params === null || !("param" in params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  const lookup = body.lookup;
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
      if (field in body && body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalTestCaseData(body)) {
    const FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await TestCase.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
