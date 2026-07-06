import { background } from "./queue.service";

export const queueJobs = async () => {
  await background.upsertJobScheduler(
    "problem-generator",
    {
      pattern: "*/5 * * * *",
    },
    {
      name: "problem-generator",
    },
  );

  await background.upsertJobScheduler(
    "test_case-generator",
    {
      pattern: "10 */2 * * *",
    },
    {
      name: "test_case-generator",
    },
  );
};
