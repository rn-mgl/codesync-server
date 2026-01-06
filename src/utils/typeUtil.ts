import { type BaseUserData } from "@interface/userInterface.ts";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attemptInterface";
import type {
  AdditionalChatMessageData,
  BaseChatMessageData,
} from "@src/interface/chatMessage";
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
  AdditionalUserProgressData,
  BaseUserProgressData,
} from "@src/interface/userInterface";
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
import type {
  AdditionalFriendshipData,
  BaseFriendshipData,
} from "@src/interface/friendshipInterface";
import type {
  AdditionalStudyGroupData,
  AdditionalStudyGroupMemberData,
  BaseStudyGroupData,
  BaseStudyGroupMemberData,
} from "@src/interface/studyGroupInterface";
import type {
  AdditionalAchievementData,
  BaseAchievementData,
} from "@src/interface/achievementInterface";

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

export const isValidLookupParam = (
  data: unknown
): data is object & Record<"param", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "param" in data &&
    typeof data.param === "string"
  );
};

export const isValidLookupBody = (
  data: unknown
): data is object & Record<"lookup", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "lookup" in data &&
    typeof data.lookup === "string"
  );
};

export const isValidUpdateParam = (
  data: unknown
): data is Object & Record<"id", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "string"
  );
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

export const isBaseChatMessageData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseChatMessageData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseChatMessageData)[] = [
    "message",
    "message_type",
    "sender_id",
    "session_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalChatMessageData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalChatMessageData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalChatMessageData)[] = ["deleted_at"];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseUserProgressData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseUserProgressData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseUserProgressData)[] = [
    "progress_data",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalUserProgressData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalUserProgressData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalUserProgressData)[] = [
    "problems_solved_today",
    "streak_days",
    "submissions_made",
    "time_spent_seconds",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseFriendshipData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseFriendshipData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseFriendshipData)[] = [
    "friend_id",
    "user_id",
    "status",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalFriendshipData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalFriendshipData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalFriendshipData)[] = [
    "accepted_at",
    "requested_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseStudyGroupData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseStudyGroupData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseStudyGroupData)[] = [
    "invite_code",
    "name",
    "owner_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalStudyGroupData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalStudyGroupData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalStudyGroupData)[] = [
    "description",
    "is_public",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseStudyGroupMemberData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseStudyGroupMemberData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseStudyGroupMemberData)[] = [
    "group_id",
    "role",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalStudyGroupMemberData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalStudyGroupMemberData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalStudyGroupMemberData)[] = [
    "joined_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isBaseAchievementData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseAchievementData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseAchievementData)[] = [
    "badge_color",
    "category",
    "description",
    "icon",
    "name",
    "points",
    "slug",
    "unlock_criteria",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
};

export const isAdditionalAchievementData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalAchievementData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalAchievementData)[] = ["deleted_at"];

  return validateFields(data, REQUIRED_FIELDS, type);
};
