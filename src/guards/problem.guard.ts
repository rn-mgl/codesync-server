import type {
  CreateProblemPayload,
  ProblemPayload,
  UpdateProblemPayload,
} from "@src/interface/problem.interface";
import {
  isArrayString,
  validateFields,
  type ValidationType,
} from "@src/utils/type.util";

export function isValidProblemData(
  data: unknown,
  type?: "full",
): data is ProblemPayload;

export function isValidProblemData(
  data: unknown,
  type: "partial",
): data is Partial<ProblemPayload>;

export function isValidProblemData(
  data: unknown,
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof ProblemPayload)[] = [
    "title",
    "slug",
    "description",
    "difficulty",
    "constraints",
    "editorial",
    "input_format",
    "output_format",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isValidCreateProblemPayload(
  data: unknown,
): data is CreateProblemPayload {
  if (!isValidProblemData(data)) return false;

  const payload = data as ProblemPayload & { topics?: unknown };

  return payload.topics === undefined || isArrayString(payload.topics);
}

export function isValidUpdateProblemPayload(
  data: unknown,
): data is UpdateProblemPayload {
  if (!isValidProblemData(data, "partial")) return false;

  const payload = data as Partial<ProblemPayload> & { topics?: unknown };

  return payload.topics === undefined || isArrayString(payload.topics);
}
