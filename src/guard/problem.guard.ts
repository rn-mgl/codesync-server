import type { ProblemPayload } from "@src/interface/problem.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidProblemPayload(
  data: unknown,
  type?: "full",
): data is ProblemPayload;

export function isValidProblemPayload(
  data: unknown,
  type: "partial",
): data is Partial<ProblemPayload>;

export function isValidProblemPayload(
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
