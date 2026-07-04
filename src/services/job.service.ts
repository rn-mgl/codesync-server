import { background } from "./queue.service";

export const queueJobs = async () => {
  console.log("running");

  await background.upsertJobScheduler(
    "problem-generator",
    {
      pattern: "*/5 * * * *",
    },
    {
      name: "problem-generator",
    },
  );
};
