import type {
  CodyChatPayload,
  CodyPayload,
} from "@src/interface/cody.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidCodyPayload(
  data: unknown,
  type?: "full",
): data is CodyPayload;

export function isValidCodyPayload(
  data: unknown,
  type: "partial",
): data is Extract<object, typeof data> & Partial<CodyPayload>;

export function isValidCodyPayload(
  data: unknown,
  type: ValidationType = "full",
) {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof CodyPayload)[] = [
    "user_id",
    "input",
    "interaction",
    "previous_interaction",
    "output",
    "name",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}

export function isValidCodyChatPayload(
  data: unknown,
): data is Extract<object, typeof data> & CodyChatPayload {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof CodyChatPayload)[] = ["input", "interaction"];

  return validateFields(data, REQUIRED_FIELDS, "full");
}
