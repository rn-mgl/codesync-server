import AppError from "@src/errors/app.error";
import type {
  BaseTopicData,
  TopicPayload,
} from "@src/interface/topic.interface";
import Topic from "@src/models/topic.model";
import { assignField, type ValidationType } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

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

export async function getTopicByLookup(
  identifier: string,
  lookup: string,
): Promise<BaseTopicData> {
  let topic: BaseTopicData[] | null = null;

  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      topic = (await Topic.findById(id)) as BaseTopicData[];

      break;
    case "slug":
      const slug = identifier;
      topic = (await Topic.findBySlug(slug)) as BaseTopicData[];

      break;

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!topic || !topic[0]) {
    throw new AppError(
      `The topic you're trying to find does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  return topic[0];
}
