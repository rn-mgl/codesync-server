import { type BaseUserData } from "@interface/userInterface.ts";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attemptsInterface";
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
  BaseSessionData,
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

const VALID_TYPES = ["string", "number", "boolean"];

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

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
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

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
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

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseTopicData = (
  data: unknown,
  type: "partial" | "full" = "full"
): data is BaseTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseTopicData)[] = [
    "name",
    "slug",
    "description",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalTopicData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalTopicData)[] = ["icon"];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseTestCaseData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseTestCaseData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseTestCaseData)[] = [
    "input",
    "expected_output",
    "memory_limit_mb",
    "problem_id",
    "time_limit_ms",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalTestCaseData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalTestCaseData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalTestCaseData)[] = ["order_index"];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(data[field as keyof object])
    );
  }
};

export const isBaseHintData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseHintData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseHintData)[] = [
    "hint_level",
    "hint_text",
    "problem_id",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalHintData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalHintData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalHintData)[] = ["order_index"];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseSubmissionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseSubmissionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseSubmissionData)[] = [
    "code",
    "language",
    "problem_id",
    "status",
    "user_id",
  ] as const;

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalSubmissionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalSubmissionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalSubmissionData)[] = [
    "error_message",
    "execution_time_ms",
    "memory_used_kb",
    "test_results",
  ] as const;

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseAttemptData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseAttemptData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseAttemptData)[] = [
    "attempt_count",
    "hints_used",
    "problem_id",
    "time_spent_seconds",
    "user_id",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalAttemptData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalAttemptData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalAttemptData)[] = ["is_solved"];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isBaseSessionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseSessionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseSessionData)[] = [
    "code",
    "host_id",
    "language",
    "max_participants",
    "problem_id",
    "status",
    "title",
    "type",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};

export const isAdditionalSessionData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalSessionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalSessionData)[] = [
    "ended_at",
    "password",
    "started_at",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        VALID_TYPES.includes(typeof data[field as keyof object])
    );
  }
};
