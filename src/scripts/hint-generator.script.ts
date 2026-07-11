import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { generateHintPrompt } from "@src/contexts/generator.context";
import { isValidCreateHintPayload } from "@src/guards/hint.guard";
import type { BaseProblemData } from "@src/interface/problem.interface";
import Hint from "@src/models/hint.model";
import Problem from "@src/models/problem.model";
import { buildHintPayload, getHintsByLookup } from "@src/services/hint.service";

export const generateHint = async () => {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  const defaultPrompt = generateHintPrompt();

  const problems = (await Problem.all()) as BaseProblemData[];

  let count: number = 0;

  for (const problem of problems) {
    console.log(`Generating for ${problem.title}`);

    const hints = await getHintsByLookup(problem.id, "problem");

    const reachedEasy = problem.difficulty === "easy" && hints.length >= 3;
    const reachedMedium = problem.difficulty === "medium" && hints.length >= 4;
    const reachedHard = problem.difficulty === "hard" && hints.length >= 5;

    if (reachedEasy || reachedMedium || reachedHard) {
      console.log(
        `Skipping ${problem.title}. ${problem.difficulty} and has ${hints.length} hints.`,
      );
      continue;
    }

    const enhancedPrompt = [
      defaultPrompt,
      `The problem you are currently working on is ${problem.title} | ${problem.slug}`,
      `Current hints are ${JSON.stringify(hints)}`,
    ];

    console.log(enhancedPrompt.join("\n\n"));

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: enhancedPrompt.join("\n\n"),
    });

    const output = interaction.output_text ?? "";

    console.log(output);

    const parsed = JSON.parse(output);

    for (const hint of parsed) {
      hint.problem = problem.slug;

      if (!isValidCreateHintPayload(hint)) {
        console.log(`Invalid hint payload: ${JSON.stringify(hint)}`);
        continue;
      }

      const payload = buildHintPayload({ ...hint, problem_id: problem.id });

      const created = await Hint.create(payload);

      console.log(
        `Created hint for ${problem.title}. Hint id ${created.insertId}`,
      );

      count++;
    }

    await sleep(60000);
  }

  return { success: true, data: { created: count } };
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

await generateHint();
