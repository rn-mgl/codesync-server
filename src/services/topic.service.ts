import AppError from "@src/errors/app.error";
import type {
  BaseTopicData,
  TopicPayload,
} from "@src/interface/topic.interface";
import Topic from "@src/models/topic.model";
import {
  assignField,
  isArrayNumber,
  isArrayString,
} from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

export function buildTopicPayload(topic: TopicPayload | Partial<TopicPayload>) {
  const payload: TopicPayload = {} as TopicPayload;

  const FIELDS: (keyof TopicPayload)[] = [
    "name",
    "slug",
    "description",
    "icon",
  ];

  for (const field of FIELDS) {
    const value = topic[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export async function getTopicByLookup(
  identifier: number,
  lookup: "id",
): Promise<BaseTopicData>;

export async function getTopicByLookup(
  identifier: string,
  lookup: "slug",
): Promise<BaseTopicData>;

export async function getTopicByLookup(
  identifier: string,
  lookup: string,
): Promise<BaseTopicData>;

export async function getTopicByLookup(
  identifier: string | number,
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

      if (typeof slug !== "string") {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

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

export async function getTopicsByLookup(
  identifier: number[],
  lookup: "ids",
): Promise<BaseTopicData[]>;

export async function getTopicsByLookup(
  identifier: string[],
  lookup: "slugs",
): Promise<BaseTopicData[]>;

export async function getTopicsByLookup(
  identifier: number,
  lookup: "problem",
): Promise<BaseTopicData[]>;

export async function getTopicsByLookup(
  identifiers: (string | number)[] | number,
  lookup: string,
): Promise<BaseTopicData[]> {
  let topics: BaseTopicData[] | null = null;

  switch (lookup) {
    case "ids":
      if (!isArrayNumber(identifiers)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      topics = (await Topic.findByIds(identifiers)) as BaseTopicData[];

      break;
    case "slugs":
      if (!isArrayString(identifiers)) {
        throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
      }

      topics = (await Topic.findBySlugs(identifiers)) as BaseTopicData[];

      break;

    case "problem":
      const problem = Number(identifiers);

      if (Number.isNaN(problem)) {
        throw new AppError(`Invalid problem.`, StatusCodes.BAD_REQUEST);
      }

      topics = (await Topic.findByProblem(problem)) as BaseTopicData[];

      break;

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  return topics;
}
