import type {
  CreateSubmissionPayload,
  SubmissionPayload,
  SubmissionType,
  ValidSubmissionLookups,
} from "@src/interface/submission.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidSubmissionPayload(
  data: unknown,
  type?: "full",
): data is SubmissionPayload;

export function isValidSubmissionPayload(
  data: unknown,
  type: "partial",
): data is Partial<SubmissionPayload>;

export function isValidSubmissionPayload(
  data: unknown,
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof SubmissionPayload)[] = [
    "user_id",
    "problem_id",
    "code",
    "language",
    "status",
    "execution_time_ms",
    "memory_used_mb",
    "test_results",
    "error_message",
  ] as const;

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isValidSubmissionType<T>(
  data: T,
): data is Extract<T, object> & SubmissionType {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return (
    "type" in data &&
    typeof data.type === "string" &&
    data.type !== undefined &&
    ["run", "test"].includes(data.type)
  );
}

export function isValidCreateSubmissionPayload<T>(
  data: T,
): data is Extract<T, object> & CreateSubmissionPayload {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof CreateSubmissionPayload)[] = [
    "code",
    "language",
    "problem",
  ];

  return validateFields(data, REQUIRED_FIELDS, "full");
}

export function isValidSubmissionLookupTypes(
  lookup: string,
): lookup is ValidSubmissionLookups {
  return ["id", "user", "problem", "status"].includes(lookup);
}
