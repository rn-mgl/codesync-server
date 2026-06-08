import type { TestCasePayload } from "@src/interface/test-case.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidTestCasePayload(
  data: unknown,
  type?: "full",
): data is TestCasePayload;

export function isValidTestCasePayload(
  data: unknown,
  type: "partial",
): data is Partial<TestCasePayload>;

export function isValidTestCasePayload(
  data: unknown,
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof TestCasePayload)[] = [
    "order_index",
    "expected_output",
    "input",
    "is_hidden",
    "is_sample",
    "memory_limit_mb",
    "problem_id",
    "time_limit_ms",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}
