import { env } from "@src/configs/env.config";
import { run } from "@src/scripts/problem-generator.script";
import { type Job, Worker } from "bullmq";
import { AchievementEvaluator } from "./achievement-evaluator.service";

export const listenerWorker = new Worker(
  "listener",
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

export const backgroundWorker = new Worker(
  "background",
  async (job: Job) => {
    switch (job.name) {
      case "problem-generator":
        await job.updateProgress("getting script");

        const result = await run();

        await job.updateProgress("done script");

        await job.log(`Result:\n\n ${JSON.stringify(result, null, 2)}`);

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
