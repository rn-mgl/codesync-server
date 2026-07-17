import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { generateProblemPrompt } from "@src/contexts/generator.context";
import { isValidCreateProblemPayload } from "@src/guards/problem.guard";
import type { BaseProblemData } from "@src/interface/problem.interface";
import Problem from "@src/models/problem.model";
import { buildProblemPayload } from "@src/services/problem.service";

export const generateProblem = async () => {
  const CAP = 1000;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  console.log("initialized AI");

  const problems = (await Problem.all()) as BaseProblemData[];

  if (problems.length > CAP) {
    return {
      success: true,
      data: { created: 0, message: `${CAP} problems created.` },
    };
  }

  const mappedProblems = problems.map((p) => ({
    title: p.title,
    slug: p.slug,
  }));

  const stringifiedProblems = JSON.stringify(mappedProblems);

  console.log("mapped problems: " + JSON.stringify(stringifiedProblems));

  const defaultPrompt = generateProblemPrompt();

  const enhancedPrompt = [
    defaultPrompt,
    "Currently uploaded problems:",
    stringifiedProblems,
    "Sample description (reference to use html instead of markdown)",
    problems[0]?.description,
    "Sample editorial (reference to use html instead of markdown)",
    problems[0]?.editorial,
  ];

  console.log(enhancedPrompt);

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: enhancedPrompt.join("\n\n"),
  });

  const response = interaction.output_text ?? "";

  let parsed: object | null = null;

  try {
    console.log("parsing response");
    parsed = JSON.parse(response);
  } catch (error) {
    console.log(error);
    throw new Error(`Invalid problem format.`);
  }

  if (!isValidCreateProblemPayload(parsed)) {
    throw new Error(`Invalid problem data.`);
  }

  const payload = buildProblemPayload(parsed);

  const created = await Problem.create(payload);

  console.log(`Created successfuly: ID ${created.insertId} - ${payload.title}`);

  return { success: true, created: { payload } };
};
