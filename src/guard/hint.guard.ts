import type { CreateHintPayload } from "@src/interface/hint.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidCreateHintPayload(
  data: unknown,
  type?: "full",
): data is CreateHintPayload;

export function isValidCreateHintPayload(
  data: unknown,
  type: "partial",
): data is Partial<CreateHintPayload>;

export function isValidCreateHintPayload(
  data: unknown,
  type: ValidationType = "full",
) {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const FIELDS: (keyof CreateHintPayload)[] = [
    "level",
    "order_index",
    "problem",
    "hint",
  ];

  return validateFields(data, FIELDS, type);
}
