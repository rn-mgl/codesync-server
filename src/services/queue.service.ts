import { env } from "@src/configs/env.config";
import { Queue } from "bullmq";

export const listener = new Queue("listener", {
  connection: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
    password: env.REDIS_PASS,
  },
});

export const background = new Queue("background", {
  connection: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
    password: env.REDIS_PASS,
  },
});
