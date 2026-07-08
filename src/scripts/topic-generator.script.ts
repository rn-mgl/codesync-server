import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { isValidTopicPayload } from "@src/guards/topic.guard";
import type { BaseTopicData } from "@src/interface/topic.interface";
import Topic from "@src/models/topic.model";
import { buildTopicPayload } from "@src/services/topic.service";
import { readFileSync } from "fs";
import path from "path";

export const generateTopic = async () => {
  console.log("Starting topic generation.");

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  const promptPath = path.join(
    process.cwd(),
    "src/contexts/topic-generator.context.md",
  );

  const allTopics = (await Topic.all()) as BaseTopicData[];

  const topics = allTopics.map((topic) => ({
    name: topic.name,
    slug: topic.slug,
    icon: topic.icon,
  }));

  const defaultPrompt = readFileSync(promptPath, "utf8");

  const enhancedPrompt = [
    defaultPrompt,
    `Current topics are: ${JSON.stringify(topics)}`,
  ];

  console.log(enhancedPrompt.join("\n\n"));

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: enhancedPrompt.join("\n\n"),
  });

  const output = interaction.output_text ?? "";

  const parsed = JSON.parse(output);

  let count = 0;

  for (const topic of parsed) {
    if (!isValidTopicPayload(topic)) {
      throw new Error(`Invalid topic data: ${JSON.stringify(topic)}`);
    }

    const payload = buildTopicPayload(topic);

    const created = await Topic.create(payload);

    console.log(`Created topic ${payload.name}. ID ${created.insertId}`);

    count++;
  }

  return {
    success: true,
    data: { created: count },
  };
};

await generateTopic();
