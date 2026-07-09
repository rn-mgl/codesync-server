import AppError from "@src/errors/app.error";
import type {
  AchievementPayload,
  BaseAchievementData,
} from "@src/interface/achievement.interface";
import Achievement from "@src/models/achievement.model";
import { assignField } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

export function buildAchievementPayload(
  achievement: AchievementPayload | Partial<AchievementPayload>,
) {
  const payload: AchievementPayload = {} as AchievementPayload;

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
    const value = achievement[field];

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

export async function getAllAchievements(
  options?: Partial<BaseAchievementData>,
): Promise<BaseAchievementData[]> {
  const achievements = (await Achievement.all(
    options,
  )) as BaseAchievementData[];

  return achievements;
}
