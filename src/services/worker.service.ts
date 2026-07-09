import { env } from "@src/configs/env.config";
import { generateProblem } from "@src/scripts/problem-generator.script";
import { type Job, Worker } from "bullmq";
import { AchievementEvaluator } from "./achievement-evaluator.service";
import { generateTestCase } from "@src/scripts/test_case-generator.script";
import { generateHint } from "@src/scripts/hint-generator.script";
import { generateTopic } from "@src/scripts/topic-generator.script";

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

        const generatedProblems = await generateProblem();

        await job.updateProgress("done script");

        await job.log(
          `Result:\n\n ${JSON.stringify(generatedProblems, null, 2)}`,
        );

        break;
      case "test_case-generator":
        await job.updateProgress("getting script");

        const generatedTestCases = await generateTestCase();

        await job.updateProgress("done script");

        await job.log(
          `Result:\n\n ${JSON.stringify(generatedTestCases, null, 2)}`,
        );

        break;
      case "hint-generator":
        await job.updateProgress("getting script");

        const generatedHints = await generateHint();

        await job.updateProgress("done script");

        await job.log(`Result:\n\n ${JSON.stringify(generatedHints, null, 2)}`);

        break;
      case "topic-generator":
        await job.updateProgress("getting script");

        const generatedTopics = await generateTopic();

        await job.updateProgress("done script");

        await job.log(
          `Result:\n\n ${JSON.stringify(generatedTopics, null, 2)}`,
        );

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
