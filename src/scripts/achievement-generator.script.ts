import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { generateAchievementPrompt } from "@src/contexts/generator.context";
import { isValidAchievementPayload } from "@src/guards/achievement.guard";
import type { BaseAchievementData } from "@src/interface/achievement.interface";
import Achievement from "@src/models/achievement.model";
import { buildAchievementPayload } from "@src/services/achievement.service";

export const generateAchievement = async () => {
  const CAP = 200;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  console.log("initialized AI");

  const defaultPrompt = generateAchievementPrompt();

  const allAchievements = (await Achievement.all()) as BaseAchievementData[];

  if (allAchievements.length > CAP) {
    return {
      success: true,
      data: { created: 0, message: `${CAP} achievements created.` },
    };
  }

  const achievements = allAchievements.map((a) => ({
    name: a.name,
    slug: a.slug,
    description: a.description,
    unlock_criteria: a.unlock_criteria,
  }));

  const enhancedPrompt = [
    defaultPrompt,
    `Currently uploaded achievements: ${JSON.stringify(achievements, null, 2)}`,
  ];

  console.log(enhancedPrompt.join("\n\n"));

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: enhancedPrompt.join("\n\n"),
  });

  const output = interaction.output_text ?? "";

  let parsed: object | null = null;

  try {
    console.log("parsing response");
    parsed = JSON.parse(output);
  } catch (error) {
    console.log(error);
    throw new Error(`Invalid achievement data.`);
  }

  if (!isValidAchievementPayload(parsed)) {
    throw new Error(`Invalid achievement data.`);
  }

  const payload = buildAchievementPayload(parsed);

  const created = await Achievement.create(payload);

  console.log(`Created successfuly: ID ${created.insertId} - ${payload.name}`);

  return { created: { payload } };
};
