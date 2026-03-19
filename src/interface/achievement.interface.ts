export interface BaseAchievementData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  badge_color: BADGE_COLORS;
  category: ACHIEVEMENT_CATEGORIES;
  unlock_criteria: string;
  points: number;
}

export interface AdditionalAchievementData {
  deleted_at: string;
}

export interface FullAchievementData
  extends BaseAchievementData, AdditionalAchievementData {
  id: number;
}

type BADGE_COLORS = "diamond" | "gold" | "silver" | "bronze";

type ACHIEVEMENT_CATEGORIES =
  | "problems"
  | "streak"
  | "social"
  | "skill"
  | "special";
