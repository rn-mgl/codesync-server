import { env } from "@src/configs/env.config";
import { type Job, Worker } from "bullmq";
import { AchievementEvaluator } from "./achievement-evaluator.service";

export const worker = new Worker(
  "queue",
  async (job: Job) => {
    await job.updateProgress("test");

    switch (job.name) {
      case "catch_achievement":
        const evaluator = new AchievementEvaluator(job.data);
        const output = await evaluator.catchAchievement();
        console.log(output);
        break;
      default:
        console.log("Unknown job");
        break;
    }
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
      password: env.REDIS_PASS,
    },
  },
);
