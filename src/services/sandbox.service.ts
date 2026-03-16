import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "fs";
import { randomUUID } from "node:crypto";
import type { SUPPORTED_LANGUAGES } from "@src/interface/submission.interface";

interface SANDBOX_DATA {
  command: string;
  image: string;
  extension: string;
}

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
) => {
  const sandbox = SANDBOXES[language];

  const runCommand = `docker run --rm -v codesync_sandbox-data:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${file}`;

  const execAsync = promisify(exec);

  const { stderr, stdout } = await execAsync(runCommand, {
    timeout: 5000,
    env: { DOCKER_API_VERSION: "1.44" },
  });

  const cleanupCommand = `docker run --rm -v codesync_sandbox-data:/data alpine rm data/${file}`;

  const cleanup = await execAsync(cleanupCommand, {
    env: { DOCKER_API_VERSION: "1.44" },
  });

  return { stderr, stdout };
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
