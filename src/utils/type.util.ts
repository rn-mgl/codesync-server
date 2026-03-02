import { type BaseUserData } from "@interface/user.interface";
import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attempt.interface";
import type {
  AdditionalChatMessageData,
  BaseChatMessageData,
} from "@src/interface/chat-message.interface";
import type {
  AdditionalCodeSnapshotData,
  BaseCodeSnapshotData,
} from "@src/interface/code-snapshot.interface";
import type {
  AdditionalHintData,
  BaseHintData,
} from "@src/interface/hint.interface";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem.interface";
import type {
  AdditionalUserAchievementData,
  AdditionalUserProgressData,
  BaseUserAchievementData,
  BaseUserProgressData,
} from "@src/interface/user.interface";
import type {
  AdditionalSessionData,
  AdditionalSessionParticipantData,
  BaseSessionData,
  BaseSessionParticipantData,
} from "@src/interface/session.interface";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
} from "@src/interface/submission.interface";
import type {
  AdditionalTestCaseData,
  BaseTestCaseData,
} from "@src/interface/test-case.interface";
import type {
  AdditionalTopicData,
  BaseTopicData,
} from "@src/interface/topic.interface";
import type {
  AdditionalFriendshipData,
  BaseFriendshipData,
} from "@src/interface/friendship.interface";
import type {
  AdditionalStudyGroupData,
  AdditionalStudyGroupMemberData,
  BaseStudyGroupData,
  BaseStudyGroupMemberData,
} from "@src/interface/study-group.interface";
import type {
  AdditionalAchievementData,
  BaseAchievementData,
} from "@src/interface/achievement.interface";

const validateFields = <T extends object>(
  data: T,
  fields: readonly string[],
  type: "full" | "partial",
) => {
  const VALID_TYPES = ["string", "number", "boolean"];

  if (type === "full") {
    return fields.every(
      (field) =>
        field in data &&
        data[field as keyof T] &&
        VALID_TYPES.includes(typeof data[field as keyof T]),
    );
  } else {
    return fields.some(
      (field) =>
        field in data &&
        data[field as keyof T] &&
        VALID_TYPES.includes(typeof data[field as keyof T]),
    );
  }
};

export const isValidLookupParam = (
  data: unknown,
): data is object & Record<"param", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "param" in data &&
    typeof data.param === "string"
  );
};

export const isValidLookupBody = (
  data: unknown,
): data is object & Record<"lookup", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "lookup" in data &&
    typeof data.lookup === "string"
  );
};

export const isValidUpdateParam = (
  data: unknown,
): data is Object & Record<"id", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "string"
  );
};

export const isValidDestroyParam = (
  data: unknown,
): data is Object & Record<"id", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "string"
  );
};

type validationType = "full" | "partial";

export function isBaseUserData(
  data: unknown,
  type?: "full",
): data is BaseUserData;

export function isBaseUserData(
  data: unknown,
  type: "partial",
): data is Partial<BaseUserData>;

export function isBaseUserData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isBaseProblemData(
  data: unknown,
  type?: "full",
): data is BaseProblemData;

export function isBaseProblemData(
  data: unknown,
  type: "partial",
): data is Partial<BaseProblemData>;

export function isBaseProblemData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseProblemData)[] = [
    "title",
    "slug",
    "description",
    "difficulty",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalProblemData(
  data: unknown,
  type?: "full",
): data is AdditionalProblemData;

export function isAdditionalProblemData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalProblemData>;

export function isAdditionalProblemData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isBaseTopicData(
  data: unknown,
  type?: "full",
): data is BaseTopicData;

export function isBaseTopicData(
  data: unknown,
  type: "partial",
): data is Partial<BaseTopicData>;

export function isBaseTopicData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseTopicData)[] = [
    "name",
    "slug",
    "description",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalTopicData(
  data: unknown,
  type?: "full",
): data is AdditionalTopicData;

export function isAdditionalTopicData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalTopicData>;

export function isAdditionalTopicData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalTopicData)[] = ["icon"];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseTestCaseData(
  data: unknown,
  type?: "full",
): data is BaseTestCaseData;

export function isBaseTestCaseData(
  data: unknown,
  type: "partial",
): data is Partial<BaseTestCaseData>;

export function isBaseTestCaseData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalTestCaseData(
  data: unknown,
  type?: "full",
): data is AdditionalTestCaseData;

export function isAdditionalTestCaseData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalTestCaseData>;

export function isAdditionalTestCaseData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalTestCaseData)[] = [
    "order_index",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseHintData(
  data: unknown,
  type?: "full",
): data is BaseHintData;

export function isBaseHintData(
  data: unknown,
  type: "partial",
): data is Partial<BaseHintData>;

export function isBaseHintData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseHintData)[] = [
    "hint_level",
    "hint_text",
    "problem_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalHintData(
  data: unknown,
  type?: "full",
): data is AdditionalHintData;

export function isAdditionalHintData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalHintData>;

export function isAdditionalHintData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalHintData)[] = [
    "order_index",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseSubmissionData(
  data: unknown,
  type?: "full",
): data is BaseSubmissionData;

export function isBaseSubmissionData(
  data: unknown,
  type: "partial",
): data is Partial<BaseSubmissionData>;

export function isBaseSubmissionData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalSubmissionData(
  data: unknown,
  type?: "full",
): data is AdditionalSubmissionData;

export function isAdditionalSubmissionData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalSubmissionData>;

export function isAdditionalSubmissionData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isBaseAttemptData(
  data: unknown,
  type?: "full",
): data is BaseAttemptData;

export function isBaseAttemptData(
  data: unknown,
  type: "partial",
): data is Partial<BaseAttemptData>;

export function isBaseAttemptData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalAttemptData(
  data: unknown,
  type?: "full",
): data is AdditionalAttemptData;

export function isAdditionalAttemptData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalAttemptData>;

export function isAdditionalAttemptData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalAttemptData)[] = [
    "is_solved",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseSessionData(
  data: unknown,
  type?: "full",
): data is BaseSessionData;

export function isBaseSessionData(
  data: unknown,
  type: "partial",
): data is Partial<BaseSessionData>;

export function isBaseSessionData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalSessionData(
  data: unknown,
  type?: "full",
): data is AdditionalSessionData;

export function isAdditionalSessionData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalSessionData>;

export function isAdditionalSessionData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalSessionData)[] = [
    "ended_at",
    "password",
    "started_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseSessionParticipantData(
  data: unknown,
  type?: "full",
): data is BaseSessionParticipantData;

export function isBaseSessionParticipantData(
  data: unknown,
  type: "partial",
): data is Partial<BaseSessionParticipantData>;

export function isBaseSessionParticipantData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseSessionParticipantData)[] = [
    "role",
    "session_id",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalSessionParticipantData(
  data: unknown,
  type?: "full",
): data is AdditionalSessionParticipantData;

export function isAdditionalSessionParticipantData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalSessionParticipantData>;

export function isAdditionalSessionParticipantData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isBaseCodeSnapshotData(
  data: unknown,
  type?: "full",
): data is BaseCodeSnapshotData;

export function isBaseCodeSnapshotData(
  data: unknown,
  type: "partial",
): data is Partial<BaseCodeSnapshotData>;

export function isBaseCodeSnapshotData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalCodeSnapshotData(
  data: unknown,
  type?: "full",
): data is AdditionalCodeSnapshotData;

export function isAdditionalCodeSnapshotData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalCodeSnapshotData>;

export function isAdditionalCodeSnapshotData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalCodeSnapshotData)[] = [];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseChatMessageData(
  data: unknown,
  type?: "full",
): data is BaseChatMessageData;

export function isBaseChatMessageData(
  data: unknown,
  type: "partial",
): data is Partial<BaseChatMessageData>;

export function isBaseChatMessageData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalChatMessageData(
  data: unknown,
  type?: "full",
): data is AdditionalChatMessageData;

export function isAdditionalChatMessageData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalChatMessageData>;

export function isAdditionalChatMessageData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalChatMessageData)[] = ["deleted_at"];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseUserProgressData(
  data: unknown,
  type?: "full",
): data is BaseUserProgressData;

export function isBaseUserProgressData(
  data: unknown,
  type: "partial",
): data is Partial<BaseUserProgressData>;

export function isBaseUserProgressData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseUserProgressData)[] = [
    "progress_data",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalUserProgressData(
  data: unknown,
  type?: "full",
): data is AdditionalUserProgressData;

export function isAdditionalUserProgressData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalUserProgressData>;

export function isAdditionalUserProgressData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isBaseFriendshipData(
  data: unknown,
  type?: "full",
): data is BaseFriendshipData;

export function isBaseFriendshipData(
  data: unknown,
  type: "partial",
): data is Partial<BaseFriendshipData>;

export function isBaseFriendshipData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseFriendshipData)[] = [
    "friend_id",
    "user_id",
    "status",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalFriendshipData(
  data: unknown,
  type?: "full",
): data is AdditionalFriendshipData;

export function isAdditionalFriendshipData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalFriendshipData>;

export function isAdditionalFriendshipData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalFriendshipData)[] = [
    "accepted_at",
    "requested_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseStudyGroupData(
  data: unknown,
  type?: "full",
): data is BaseStudyGroupData;

export function isBaseStudyGroupData(
  data: unknown,
  type: "partial",
): data is Partial<BaseStudyGroupData>;

export function isBaseStudyGroupData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseStudyGroupData)[] = [
    "invite_code",
    "name",
    "owner_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalStudyGroupData(
  data: unknown,
  type?: "full",
): data is AdditionalStudyGroupData;

export function isAdditionalStudyGroupData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalStudyGroupData>;

export function isAdditionalStudyGroupData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalStudyGroupData)[] = [
    "description",
    "is_public",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseStudyGroupMemberData(
  data: unknown,
  type?: "full",
): data is BaseStudyGroupMemberData;

export function isBaseStudyGroupMemberData(
  data: unknown,
  type: "partial",
): data is Partial<BaseStudyGroupMemberData>;

export function isBaseStudyGroupMemberData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseStudyGroupMemberData)[] = [
    "group_id",
    "role",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalStudyGroupMemberData(
  data: unknown,
  type?: "full",
): data is AdditionalStudyGroupMemberData;

export function isAdditionalStudyGroupMemberData(
  data: unknown,
  type?: "full",
): data is Partial<AdditionalStudyGroupMemberData>;

export function isAdditionalStudyGroupMemberData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalStudyGroupMemberData)[] = [
    "joined_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseAchievementData(
  data: unknown,
  type?: "full",
): data is BaseAchievementData;

export function isBaseAchievementData(
  data: unknown,
  type: "partial",
): data is Partial<BaseAchievementData>;

export function isBaseAchievementData(
  data: unknown,
  type: validationType = "full",
): boolean {
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
}

export function isAdditionalAchievementData(
  data: unknown,
  type?: "full",
): data is AdditionalAchievementData;

export function isAdditionalAchievementData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalAchievementData>;

export function isAdditionalAchievementData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalAchievementData)[] = ["deleted_at"];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isBaseUserAchievementData(
  data: unknown,
  type?: "full",
): data is BaseUserAchievementData;

export function isBaseUserAchievementData(
  data: unknown,
  type: "partial",
): data is Partial<BaseUserAchievementData>;

export function isBaseUserAchievementData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseUserAchievementData)[] = [
    "achievement_id",
    "user_id",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isAdditionalUserAchievementData(
  data: unknown,
  type?: "full",
): data is AdditionalUserAchievementData;

export function isAdditionalUserAchievementData(
  data: unknown,
  type: "partial",
): data is Partial<AdditionalUserAchievementData>;

export function isAdditionalUserAchievementData(
  data: unknown,
  type: validationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalUserAchievementData)[] = [
    "earned_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export const assignField = <T extends object, K extends keyof T>(
  key: K,
  value: T[K],
  fields: T,
) => {
  fields[key] = value;
};
