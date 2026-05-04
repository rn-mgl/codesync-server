import type { TopicPayload } from "@src/interface/topic.interface";
import { assignField, type ValidationType } from "@src/utils/type.util";

export function buildTopicPayload(
  topic: TopicPayload,
  type?: "full",
): TopicPayload;

export function buildTopicPayload(
  topic: Partial<TopicPayload>,
  type: "partial",
): Partial<TopicPayload>;

export function buildTopicPayload(
  topic: TopicPayload | Partial<TopicPayload>,
  type: ValidationType = "full",
) {
  const payload: typeof type extends "full"
    ? TopicPayload
    : Partial<TopicPayload> = {};

  const FIELDS: (keyof TopicPayload)[] = [
    "name",
    "slug",
    "description",
    "icon",
  ];

  for (const field of FIELDS) {
    const value = topic[field as keyof TopicPayload];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}
