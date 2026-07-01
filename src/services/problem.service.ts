import AppError from "@src/errors/app.error";
import type {
  BaseProblemData,
  ProblemPayload,
  SoftDeleteProblemPayload,
} from "@src/interface/problem.interface";
import Problem from "@src/models/problem.model";
import { assignField } from "@src/utils/type.util";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

export function buildProblemPayload(
  problem: ProblemPayload | Partial<ProblemPayload>,
) {
  const payload: ProblemPayload | Partial<ProblemPayload> = {};

  const FIELDS: (keyof ProblemPayload)[] = [
    "title",
    "slug",
    "description",
    "difficulty",
    "constraints",
    "editorial",
    "input_format",
    "output_format",
  ];

  for (const field of FIELDS) {
    const value = problem[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export async function getProblemByLookup(
  identifier: string,
  lookup: string,
): Promise<BaseProblemData> {
  let problem: BaseProblemData[] | null = null;

  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid id.`, StatusCodes.BAD_REQUEST);
      }

      problem = (await Problem.findById(id)) as BaseProblemData[];

      break;
    case "slug":
      problem = (await Problem.findBySlug(identifier)) as BaseProblemData[];

      break;
    default:
      throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!problem.length || !problem[0]) {
    throw new AppError(`Problem not found.`, StatusCodes.NOT_FOUND);
  }

  return problem[0];
}

export function buildDeleteProblemPayload(
  slug: string,
): SoftDeleteProblemPayload {
  const updateData: SoftDeleteProblemPayload = {
    deleted_at: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
    slug: slug + "_" + randomUUID(),
  };

  return updateData;
}
