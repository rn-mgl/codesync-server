import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { isValidTestCasePayload } from "@src/guards/test-case.guard";
import type { BaseProblemData } from "@src/interface/problem.interface";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import {
  buildTestCasePayload,
  getTestCaseByLookup,
} from "@src/services/test-case.service";
import { readFileSync } from "fs";
import path from "path";

export const run = async () => {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  const promptPath = path.join(
    process.cwd(),
    "src/contexts/test_case-generator.context.md",
  );

  console.log(`Prompt path: ${promptPath}`);

  const defaultPrompt = readFileSync(promptPath, "utf8");

  const problems = (await Problem.all()) as BaseProblemData[];

  problems.pop();

  const exampleProblemInputFormat = `{"name":"twoSum","style":"function","params":[{"name":"nums","type":"number[]"},{"name":"target","type":"number"}],"version":1}`;
  const exampleProblemOutputFormat = `{"type":"number[]","version":1,"comparison":{"ordered":false}}`;

  const exampleTestCaseInputFormat = `{"nums":[2,7,11,15],"target":9}`;
  const exampleTestCaseOutputFormat = `[0,1]`;

  let count: number = 0;

  for (const problem of problems) {
    console.log(`Generating for ${problem.title}`);

    const testCases = (await getTestCaseByLookup(problem.id, "problem")).map(
      (tc) => ({ input: tc.input, output: tc.expected_output }),
    );

    const enhancedPrompt = [
      defaultPrompt,
      `The problem you are currently working on is ${problem.title} | ${problem.slug}`,
      `It's Input Format is ${JSON.stringify(problem.input_format)}`,
      `It's Output Format is ${JSON.stringify(problem.output_format)}`,
      `Constraints are ${JSON.stringify(problem.constraints)}`,
      `Current Test Cases: ${JSON.stringify(testCases)}`,
      `[EXAMPLE FOR REFERENCE ONLY:START]`,
      `Problem Input Format: ${exampleProblemInputFormat}`,
      `Problem Output Format: ${exampleProblemOutputFormat}`,
      `Problem Test Case Input Based on Input Format: ${exampleTestCaseInputFormat}`,
      `Problem Test Case Output Based on Output Format: ${exampleTestCaseOutputFormat}`,
      `[EXAMPLE FOR REFERENCE ONLY:END]`,
    ];

    console.log(`Enhanced: ${enhancedPrompt.join("\n\n")}`);

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: enhancedPrompt.join("\n\n"),
    });

    const response = interaction.output_text ?? "";

    const parsed = JSON.parse(response);

    for (const tc of parsed) {
      tc.problem_id = problem.id;

      if (!isValidTestCasePayload(tc)) {
        console.log(`Generated test case ${JSON.stringify(tc)} is not valid.`);
        continue;
      }

      const payload = buildTestCasePayload(tc);

      const created = await TestCase.create(payload);

      console.log(`Created test case ${created.insertId} for ${problem.title}`);

      if (created) count++;
    }

    await sleep(60000);
  }

  return { success: true, data: { created: count } };
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
