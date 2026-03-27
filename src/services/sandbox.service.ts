import { env } from "@src/configs/env.config";
import type { FullProblemData } from "@src/interface/problem.interface";
import type { SUPPORTED_LANGUAGES } from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import fs from "fs";
import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

interface SANDBOX_DATA {
  command: string;
  image: string;
  extension: string;
}

const execAsync = promisify(exec);

const SANDBOX_CODE_VOLUME = "codesync_sandbox-data";
const SANDBOX_CLEANER_IMAGE = "sandbox-cleaner-image";

const SANDBOXES: Record<SUPPORTED_LANGUAGES, SANDBOX_DATA> = {
  javascript: {
    command: "node",
    image: "javascript-sandbox-image",
    extension: "js",
  },
  php: {
    command: "php",
    image: "",
    extension: "php",
  },
} as const;

export const processCode = async (
  language: SUPPORTED_LANGUAGES,
  file: string,
): Promise<{
  stderr: string;
  stdout: string;
}> => {
  const sandbox = SANDBOXES[language];

  let processedCode: { stderr: string; stdout: string } = {
    stderr: "",
    stdout: "",
  };

  try {
    const runCommand = `docker run --rm -v ${SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${file}`;

    processedCode = await execAsync(runCommand, {
      timeout: 5000,
      env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
    });
  } catch (error: any) {
    processedCode.stderr = error.stderr ?? "Execution error";
  }

  return processedCode;
};

export const createSandboxFile = (
  language: SUPPORTED_LANGUAGES,
  code: string,
) => {
  const uuid = randomUUID();

  const sandbox = SANDBOXES[language];

  const fileName = `${language}_${uuid}.${sandbox.extension}`;

  const path = `./sandbox/${fileName}`;

  fs.writeFileSync(path, code);

  return fileName;
};

export const cleanupSandbox = async (file: string) => {
  try {
    const command = `docker run --rm -v ${SANDBOX_CODE_VOLUME}:/data/code ${SANDBOX_CLEANER_IMAGE} rm code/${file}`;

    const { stderr, stdout } = await execAsync(command, {
      env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
    });

    return { stderr, stdout };
  } catch (error) {
    console.log(error);
  }
};

const generateTestCaseArray = (testCases: FullTestCaseData[]) => {
  const testCasesInit = `const testCases = ${JSON.stringify(testCases, null, 2)}`;

  return testCasesInit;
};

export const generateCodeProcessor = (
  code: string,
  problem: FullProblemData,
  testCases: FullTestCaseData[],
): string => {
  const testCasesInit = generateTestCaseArray(testCases);

  // function name from input format
  const executeCode = problem.input_format.name;

  // pass all parameters from input format
  const parameters = problem.input_format.params
    .map((p) => `tc.input.${p.name}`)
    .join(", ");

  const testCaseLoop = [
    "for (const tc of testCases) {",
    "\n\t",
    `console.log(${executeCode}(${parameters}))`,
    "\n",
    "}",
  ];

  const command = [
    `${testCasesInit}`,
    "\n\n",
    code,
    "\n\n",
    testCaseLoop.join(""),
  ];

  return command.join("");
};
