import { env } from "@src/configs/env.config";
import { Queue } from "bullmq";

export const queue = new Queue("queue", {
  connection: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
  },
});
