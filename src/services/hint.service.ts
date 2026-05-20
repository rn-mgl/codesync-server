import AppError from "@src/errors/app.error";
import type { BaseHintData, HintPayload } from "@src/interface/hint.interface";
import Hint from "@src/models/hint.model";
import { assignField, type ValidationType } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";
import { getProblemByLookup } from "./problem.service";
import Problem from "@src/models/problem.model";
import type { BaseProblemData } from "@src/interface/problem.interface";

export function buildHintPayload(data: HintPayload, type?: "full"): HintPayload;

export function buildHintPayload(
  data: Partial<HintPayload>,
  type?: "partial",
): Partial<HintPayload>;

export function buildHintPayload(
  data: HintPayload | Partial<HintPayload>,
  type: ValidationType = "full",
) {
  const payload: typeof type extends "full"
    ? HintPayload
    : Partial<HintPayload> = {};

  const FIELDS: (keyof HintPayload)[] = [
    "level",
    "order_index",
    "problem_id",
    "hint",
  ];

  for (const field of FIELDS) {
    const value = data[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    } else if (value === undefined && type === "full") {
      throw new AppError(`All values are required.`, StatusCodes.BAD_REQUEST);
    }
  }

  return payload;
}

export async function getHintByLookup(
  identfier: string,
  lookup: "id",
): Promise<BaseHintData>;

export async function getHintByLookup(
  identfier: string,
  lookup: "problem",
): Promise<BaseHintData[]>;

export async function getHintByLookup(
  identfier: string,
  lookup: string,
): Promise<BaseHintData | BaseHintData[]>;

export async function getHintByLookup(identifier: string, lookup: string) {
  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      const hint = (await Hint.findById(id)) as BaseHintData[];

      if (!hint || !hint[0]) {
        throw new AppError(
          `The hint you're trying to find does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return hint[0];

    case "problem":
      const problem = Number(identifier);

      if (Number.isNaN(problem)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      const hints = (await Hint.findByProblem(problem)) as BaseHintData[];

      return hints;
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
}

export async function getAllHints(problemSlug?: string) {
  const mappedHints = new Map<string, BaseHintData[]>();

  if (problemSlug) {
    const problem = await getProblemByLookup(problemSlug, "slug");

    const hints = (await Hint.findByProblem(problem.id)) as BaseHintData[];

    mappedHints.set(problem.slug, hints);
  } else {
    const problems = (await Problem.all()) as BaseProblemData[];

    for (const p of problems) {
      const hint = (await Hint.findByProblem(p.id)) as BaseHintData[];

      mappedHints.set(p.slug, hint);
    }
  }

  return mappedHints;
}
