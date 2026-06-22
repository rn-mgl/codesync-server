import { env } from "@src/configs/env.config";
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export const redisClient = async () => {
  client = await createClient({
    socket: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },
    password: env.REDIS_PASS,
  })
    .on("err", (e) => console.log(`Redis Error: ${e}`))
    .connect();

  return client;
};
