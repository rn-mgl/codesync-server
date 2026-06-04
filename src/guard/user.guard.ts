import type {
  BaseUserData,
  CreateUserPayload,
  UpdateUserPayload,
} from "@src/interface/user.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidCreateUserPayload(
  data: unknown,
): data is CreateUserPayload {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof CreateUserPayload)[] = [
    "email",
    "first_name",
    "last_name",
    "password",
    "username",
  ];

  return validateFields(data, REQUIRED_FIELDS, "full");
}

export function isValidUpdateUserPayload(
  data: unknown,
): data is UpdateUserPayload {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof UpdateUserPayload)[] = [
    "deleted_at",
    "first_name",
    "image",
    "is_verified",
    "last_name",
    "problems_solved",
    "total_submissions",
    "username",
  ];

  return validateFields(data, REQUIRED_FIELDS, "partial");
}

export function isValidUserData(
  data: unknown,
  type?: "full",
): data is BaseUserData;

export function isValidUserData(
  data: unknown,
  type: "partial",
): data is Partial<BaseUserData>;

export function isValidUserData(data: unknown, type: ValidationType = "full") {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof BaseUserData)[] = [
    "id",
    "username",
    "first_name",
    "last_name",
    "email",
    "password",
    "image",
    "problems_solved",
    "total_submissions",
    "created_at",
    "updated_at",
    "is_verified",
    "deleted_at",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}
