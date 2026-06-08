import type { TopicPayload } from "@src/interface/topic.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidTopicPayload(
  data: unknown,
  type?: "full",
): data is TopicPayload;

export function isValidTopicPayload(
  data: unknown,
  type: "partial",
): data is Partial<TopicPayload>;

export function isValidTopicPayload(
  data: unknown,
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) return false;

  const REQUIRED_FIELDS: (keyof TopicPayload)[] = [
    "description",
    "icon",
    "name",
    "slug",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}
