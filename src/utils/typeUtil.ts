import { type BaseUserData } from "@interface/userInterface.ts";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attemptsInterface";
import type {
  AdditionalCodeSnapshotData,
  BaseCodeSnapshotData,
} from "@src/interface/codeSnapshot";
import type {
  AdditionalHintData,
  BaseHintData,
} from "@src/interface/hintInterface";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problemInterface";
import type {
  AdditionalSessionData,
  AdditionalSessionParticipantData,
  BaseSessionData,
  BaseSessionParticipantData,
} from "@src/interface/sessionInterface";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
} from "@src/interface/submissionInterface";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
} from "@src/interface/testCaseInterface";
import type {
  AdditionalTopicData,
  BaseTopicData,
} from "@src/interface/topicInterface";

const validateFields = (
  data: object,
  fields: readonly string[],
  type: "full" | "partial"
) => {
  const VALID_TYPES = ["string", "number", "boolean"];

  if (type === "full") {
    return fields.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return fields.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseUserData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseUserData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseUserData)[] = [
    "email",
    "first_name",
    "last_name",
    "password",
    "username",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseProblemData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseProblemData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseProblemData)[] = [
    "title",
    "slug",
    "description",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalProblemData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalProblemData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalProblemData)[] = [
    "constraints",
    "editorial",
    "input_format",
    "output_format",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseTopicData = (
  data: unknown,
  type: "partial" | "full" = "full"
): data is BaseTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseTopicData)[] = [
    "name",
    "slug",
    "description",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalTopicData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalTopicData)[] = ["icon"];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseTestCaseData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseTestCaseData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseTestCaseData)[] = [
    "input",
    "expected_output",
    "memory_limit_mb",
    "problem_id",
    "time_limit_ms",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalTestCaseData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalTestCaseData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalTestCaseData)[] = [
    "order_index",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseHintData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseHintData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseHintData)[] = [
    "hint_level",
    "hint_text",
    "problem_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalHintData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalHintData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalHintData)[] = [
    "order_index",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseSubmissionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseSubmissionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseSubmissionData)[] = [
    "code",
    "language",
    "problem_id",
    "status",
    "user_id",
  ] as const;

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalSubmissionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalSubmissionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalSubmissionData)[] = [
    "error_message",
    "execution_time_ms",
    "memory_used_kb",
    "test_results",
  ] as const;

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseAttemptData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseAttemptData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseAttemptData)[] = [
    "attempt_count",
    "hints_used",
    "problem_id",
    "time_spent_seconds",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalAttemptData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalAttemptData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalAttemptData)[] = [
    "is_solved",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseSessionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseSessionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseSessionData)[] = [
    "code",
    "host_id",
    "language",
    "max_participants",
    "problem_id",
    "status",
    "title",
    "type",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalSessionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalSessionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalSessionData)[] = [
    "ended_at",
    "password",
    "started_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseSessionParticipantData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseSessionParticipantData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseSessionParticipantData)[] = [
    "role",
    "session_id",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalSessionParticipantData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalSessionParticipantData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalSessionParticipantData)[] = [
    "is_active",
    "left_at",
    "lines_added",
    "lines_deleted",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseCodeSnapshotData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseCodeSnapshotData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseCodeSnapshotData)[] = [
    "change_type",
    "code_content",
    "cursor_pointer",
    "line_number",
    "session_id",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalCodeSnapshotData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalCodeSnapshotData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalCodeSnapshotData)[] = [];

  return validateFields(data, REQUIRED_FIELDS, type);
};
