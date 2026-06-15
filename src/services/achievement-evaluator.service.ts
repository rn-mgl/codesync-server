import { createConnection } from "@src/database/database";
import AppError from "@src/errors/app.error";
import type {
  ACHIEVEMENT_CATEGORIES,
  AchievementEvaluatorData,
  UnlockCriteria,
} from "@src/interface/achievement.interface";
import type { UserAchievementPayload } from "@src/interface/user.interface";
import UserAchievement from "@src/models/user-achievement.model";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAllAchievements } from "./achievement.service";

class AchievementEvaluator implements AchievementEvaluatorData {
  readonly category: ACHIEVEMENT_CATEGORIES;
  readonly userId: number;

  constructor(data: AchievementEvaluatorData) {
    this.category = data.category;
    this.userId = data.userId;
  }

  async catchAchievement() {
    const achievements = await getAllAchievements({ category: this.category });

    let created = 0;

    for (const achievement of achievements) {
      const resolved = await this.resolveCriteria(achievement.unlock_criteria);

      const matched = this.compare(achievement.unlock_criteria, resolved);

      if (matched) {
        const userAchievement = await UserAchievement.findByBridge(
          this.userId,
          achievement.id,
        );

        if (userAchievement && userAchievement.length > 0) {
          continue;
        }

        const payload: UserAchievementPayload = {
          user_id: this.userId,
          achievement_id: achievement.id,
        };

        await UserAchievement.create(payload);

        created++;
      }
    }

    return { created };
  }

  private compare(criteria: UnlockCriteria, resolved: number) {
    const value = criteria.value;

    if (value === undefined) {
      throw new AppError(
        `Criteria value is not set.`,
        StatusCodes.FAILED_DEPENDENCY,
      );
    }

    if (criteria.operator === "=") {
      return resolved === value;
    } else if (criteria.operator === "<=") {
      return resolved <= value;
    } else if (criteria.operator === ">=") {
      return resolved >= value;
    } else {
      throw new AppError(`Unkown operator.`, StatusCodes.FAILED_DEPENDENCY);
    }
  }

  // map by type
  private async resolveCriteria(criteria: UnlockCriteria): Promise<number> {
    switch (this.category) {
      case "problems":
        return await this.resolveProblemsAchievement(criteria);
      default:
        return 0;
    }
  }

  private async resolveProblemsAchievement(criteria: UnlockCriteria) {
    switch (criteria.type) {
      case "metric_threshold":
        return await this.resolveProblemMetric(criteria);
      case "streak":
        return await this.resolveProblemMetric(criteria);
      default:
        throw new AppError(
          `Unkown type of criteria.`,
          StatusCodes.FAILED_DEPENDENCY,
        );
    }
  }

  private async resolveProblemMetric(
    criteria: UnlockCriteria,
  ): Promise<number> {
    switch (criteria.metric) {
      case "problems_solved":
        return await this.countProblemsSolved(criteria);
      case "problem_solve_streak_days":
        return await this.countProblemSolveStreakDays();
      default:
        throw new AppError(`Invalid metric.`, StatusCodes.FAILED_DEPENDENCY);
    }
  }

  private async countProblemSolveStreakDays() {
    const db = createConnection();

    const query = `SELECT MAX(DATE(created_at)) AS created_at FROM submissions
                  WHERE status = "accepted"
                  AND user_id = ?
                  GROUP BY DATE(created_at)
                  ORDER BY MAX(DATE(created_at)) DESC;`;

    const values = [this.userId];

    const result = await db.execute<
      (ResultSetHeader & { created_at: string })[]
    >(query, values);

    const dates = result[0];

    let streak = 0;
    let mostRecent = dates[0]?.created_at ?? "0000-00-00 00:00:00"; // this is the most recent date entry in the db

    const today = DateTime.now().diff(
      DateTime.fromFormat(mostRecent, "yyyy-MM-dd"),
    ).days;

    // meaning there's no entry for today so there's no valid streak
    if (today > 0) return 0;

    for (let i = 1; i < dates.length; i++) {
      const older = dates[i]?.created_at ?? "0000-00-00 00:00:00";

      const olderDate = DateTime.fromFormat(older, "yyyy-MM-dd"); // this is the previous date entry
      const mostRecentDate = DateTime.fromFormat(mostRecent, "yyyy-MM-dd");

      const diff = mostRecentDate.diff(olderDate, "days").days;

      // meaning the gap between the most recent date and the older date is more than 1 day
      if (diff > 1) {
        break;
      }

      mostRecent = older;
      streak++;
    }

    return streak;
  }

  private async countProblemsSolved(criteria: UnlockCriteria): Promise<number> {
    const db = createConnection();

    const query = `SELECT COUNT(*) AS total_submissions FROM submissions
                  WHERE status = "accepted"
                  AND created_at >= ?
                  AND created_at < ?
                  AND user_id = ?;`;

    const values: string[] = [];

    switch (criteria.scope) {
      case "lifetime":
        values.push("0000-00-00 00:00:00", DateTime.now().toSQL());
        break;
      case "daily":
        values.push(
          DateTime.now().minus({ days: 1 }).toSQL(),
          DateTime.now().toSQL(),
        );
        break;
      case "weekly":
        values.push(
          DateTime.now().minus({ weeks: 1 }).toSQL(),
          DateTime.now().toSQL(),
        );
        break;
    }

    const result = await db.execute<
      (RowDataPacket & { total_submissions: number })[]
    >(query, [...values, this.userId]);

    return result[0][0]?.total_submissions ?? 0;
  }
}

export { AchievementEvaluator };
