import type { AchievementPayload } from "@src/interface/achievement.interface";
import { validateFields, type ValidationType } from "@src/utils/type.util";

export function isValidAchievementPayload(
  data: unknown,
  type?: "full",
): data is AchievementPayload;

export function isValidAchievementPayload(
  data: unknown,
  type: "partial",
): data is Partial<AchievementPayload>;

export function isValidAchievementPayload(
  data: unknown,
  type: ValidationType = "full",
): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AchievementPayload)[] = [
    "badge_color",
    "category",
    "description",
    "icon",
    "name",
    "points",
    "slug",
    "unlock_criteria",
  ];

  return validateFields(data, REQUIRED_FIELDS, type);
}
