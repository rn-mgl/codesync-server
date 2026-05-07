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
  AdditionalFriendshipData,
  BaseFriendshipData,
} from "@src/interface/friendship.interface";
import type {
  AdditionalHintData,
  BaseHintData,
} from "@src/interface/hint.interface";
import type {
  AdditionalSessionData,
  AdditionalSessionParticipantData,
  BaseSessionData,
  BaseSessionParticipantData,
} from "@src/interface/session.interface";
import type {
  AdditionalStudyGroupData,
  AdditionalStudyGroupMemberData,
  BaseStudyGroupData,
  BaseStudyGroupMemberData,
} from "@src/interface/study-group.interface";
import type {
  AdditionalUserAchievementData,
  AdditionalUserProgressData,
  BaseUserAchievementData,
  BaseUserProgressData,
} from "@src/interface/user.interface";

export type ValidationType = "full" | "partial";

export const validateFields = <T extends object>(
  data: T,
  fields: readonly string[],
  type: "full" | "partial",
) => {
  if (type === "full") {
    return fields.every(
      (field) => field in data && data[field as keyof T] !== undefined,
    );
  } else {
    return fields.some(
      (field) => field in data && data[field as keyof T] !== undefined,
    );
  }
};

export const isValidIdParam = <T>(
  data: T,
): data is Extract<T, object> & Record<"id", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "string"
  );
};

export const isValidIdentifierParam = <T>(
  data: T,
): data is Extract<T, object> & Record<"identifier", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "identifier" in data &&
    typeof data.identifier === "string"
  );
};

export const isValidSlugParam = <T>(
  data: T,
): data is Extract<T, object> & Record<"slug", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "slug" in data &&
    typeof data.slug === "string"
  );
};

export const isValidLookupQuery = <T>(
  data: T,
): data is Extract<T, object> & Record<"lookup", string> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "lookup" in data &&
    data.lookup !== undefined &&
    typeof data.lookup === "string"
  );
};

export const isValidObject = <T>(
  data: T,
): data is Extract<T, object> & Record<string, unknown> => {
  return typeof data === "object" && data !== null;
};

export const isValidString = (data: unknown): data is string => {
  return typeof data === "string";
};

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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalHintData)[] = [
    "order_index",
  ];

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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseStudyGroupData)[] = [
    "invite_code",
    "name",
    "owner_id",
    "slug",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalStudyGroupMemberData)[] = [
    "joined_at",
  ];

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
  type: ValidationType = "full",
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
  type: ValidationType = "full",
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

export function isArrayString(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((d) => typeof d === "string");
}

export function isArrayNumber(data: unknown): data is number[] {
  return Array.isArray(data) && data.every((d) => typeof d === "number");
}
