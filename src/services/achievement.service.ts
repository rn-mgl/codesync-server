import AppError from "@src/errors/app.error";
import type {
  AchievementPayload,
  BaseAchievementData,
  SoftDeleteAchievementPayload,
} from "@src/interface/achievement.interface";
import Achievement from "@src/models/achievement.model";
import { assignField, type ValidationType } from "@src/utils/type.util";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

export function buildAchievementPayload(
  achievement: AchievementPayload,
  type?: "full",
): AchievementPayload;

export function buildAchievementPayload(
  achievement: Partial<AchievementPayload>,
  type: "partial",
): Partial<AchievementPayload>;

export function buildAchievementPayload(
  achievement: AchievementPayload | Partial<AchievementPayload>,
  type: ValidationType = "full",
) {
  const payload: typeof type extends "full"
    ? AchievementPayload
    : Partial<AchievementPayload> = {};

  const FIELDS: (keyof AchievementPayload)[] = [
    "badge_color",
    "category",
    "description",
    "icon",
    "name",
    "points",
    "slug",
    "unlock_criteria",
  ];

  for (const field of FIELDS) {
    const value = achievement[field as keyof AchievementPayload];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export async function getAchievementByLookup(
  identifier: string,
  lookup: string,
): Promise<BaseAchievementData> {
  let achievement: BaseAchievementData[] | null = null;

  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(
          `Invalid achievement record.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      achievement = (await Achievement.findById(id)) as BaseAchievementData[];

      break;
    case "slug":
      const slug = identifier;

      achievement = (await Achievement.findBySlug(
        slug,
      )) as BaseAchievementData[];

      break;
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!achievement.length || !achievement[0]) {
    throw new AppError(
      `The achievement you're trying to get does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  return achievement[0];
}

export function buildDeleteAchievementPayload(slug: string) {
  const updateData: SoftDeleteAchievementPayload = {
    deleted_at: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
    slug: slug + "_" + randomUUID(),
  };

  return updateData;
}
