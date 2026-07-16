import AppError from "@src/errors/app.error";
import type { BaseProblemData } from "@src/interface/problem.interface";
import type {
  BaseTestCaseData,
  TestCasePayload,
} from "@src/interface/test-case.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import { assignField } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";
import { getProblemByLookup } from "./problem.service";
import type { Paginate, RecordCount } from "@src/interface/model.interface";
import { getRecordCount } from "@src/utils/model.util";

export function buildTestCasePayload(
  testCase: TestCasePayload | Partial<TestCasePayload>,
) {
  const payload: TestCasePayload = {} as TestCasePayload;

  const FIELDS: (keyof TestCasePayload)[] = [
    "expected_output",
    "input",
    "is_hidden",
    "is_sample",
    "memory_limit_mb",
    "order_index",
    "problem_id",
    "time_limit_ms",
  ];

  for (const field of FIELDS) {
    const value = testCase[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export async function getTestCaseByLookup(
  identifier: number,
  lookup: "id",
  options?: Partial<BaseTestCaseData>,
): Promise<BaseTestCaseData>;

export async function getTestCaseByLookup(
  identifier: number,
  lookup: "problem",
  options?: Partial<BaseTestCaseData>,
): Promise<BaseTestCaseData[]>;

export async function getTestCaseByLookup(
  identifier: number,
  lookup: string,
  options?: Partial<BaseTestCaseData>,
): Promise<BaseTestCaseData | BaseTestCaseData[]>;

export async function getTestCaseByLookup(
  identifier: number,
  lookup: string,
  options?: Partial<BaseTestCaseData>,
) {
  let testCase: BaseTestCaseData | BaseTestCaseData[] | null = null;

  switch (lookup) {
    case "id":
      testCase = (await TestCase.findById(identifier)) as BaseTestCaseData[];

      if (!testCase || !testCase[0]) {
        throw new AppError(
          `The test case you are trying to update does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      testCase = testCase[0];

      break;
    case "problem":
      testCase = (await TestCase.findByProblem(
        identifier,
        options,
      )) as BaseTestCaseData[];

      break;

    default:
      throw new AppError(`Invalid lookup key.`, StatusCodes.BAD_REQUEST);
  }

  return testCase;
}

export async function getAllTestCases(
  problemSlug?: string,
  paginate?: Paginate,
): Promise<Map<string, BaseTestCaseData[]>> {
  const testCases: Map<string, BaseTestCaseData[]> = new Map();

  if (problemSlug) {
    const problem = await getProblemByLookup(problemSlug, "slug");

    const problemTestCases = (await TestCase.findByProblem(
      problem.id,
    )) as BaseTestCaseData[];

    testCases.set(problem.slug, problemTestCases);
  } else {
    const problems = (await Problem.all(paginate)) as BaseProblemData[];

    for (const p of problems) {
      const testCase = (await TestCase.findByProblem(
        p.id,
      )) as BaseTestCaseData[];

      testCases.set(p.slug, testCase);
    }
  }

  return testCases;
}

export async function getTestCasesCount(
  problemSlug?: string,
  paginate?: Paginate,
): Promise<Map<string, number>> {
  const testCases: Map<string, number> = new Map();

  if (problemSlug) {
    const problem = await getProblemByLookup(problemSlug, "slug");

    const problemTestCases = (await getRecordCount("test_cases", {
      problem_id: problem.id,
    })) as RecordCount;

    testCases.set(problem.slug, problemTestCases.count);
  } else {
    const problems = (await Problem.all(paginate)) as BaseProblemData[];

    for (const p of problems) {
      const testCase = (await getRecordCount("test_cases", {
        problem_id: p.id,
      })) as RecordCount;

      testCases.set(p.slug, testCase.count);
    }
  }

  return testCases;
}
