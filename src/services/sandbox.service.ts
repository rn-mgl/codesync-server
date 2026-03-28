import { env } from "@src/configs/env.config";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  SandboxData,
  SandboxServiceData,
} from "@src/interface/sandbox.interface";
import type { SupportedLanguages } from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import fs from "fs";
import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

class SandboxService implements SandboxServiceData {
  code: string;
  language: SupportedLanguages;
  problem: FullProblemData;
  testCases: FullTestCaseData[];

  private file: string | null = null;
  private readonly execAsync = promisify(exec);
  private readonly SANDBOX_CODE_VOLUME: string = "codesync_sandbox-data";
  private readonly SANDBOX_CLEANER_IMAGE: string = "sandbox-cleaner-image";
  private readonly SANDBOXES: Record<SupportedLanguages, SandboxData> = {
    javascript: {
      command: "node",
      image: "javascript-sandbox-image",
      extension: "js",
      testCaseInit: "const testCases",
    },
    php: {
      command: "php",
      image: "",
      extension: "php",
      testCaseInit: "$testCases",
    },
  } as const;

  constructor(data: SandboxServiceData) {
    this.code = data.code;
    this.language = data.language;
    this.problem = data.problem;
    this.testCases = data.testCases;
  }

  createSandboxFile(): void {
    const uuid = randomUUID();

    const sandbox = this.SANDBOXES[this.language];

    const fileName = `${this.language}_${uuid}.${sandbox.extension}`;

    const path = `./sandbox/${fileName}`;

    fs.writeFileSync(path, this.code);

    this.setFile(fileName);

    return;
  }

  generateCodeProcessor(): void {
    const initializedTestCases = this.generateTestCaseArray();

    // function name from input format
    const executeCode = this.problem.input_format.name;

    // pass all parameters from input format, access value under tc.input in testCaseLoop
    const parameters = this.problem.input_format.params
      .map((p) => `tc.input.${p.name}`)
      .join(", ");

    const testCaseLoop = [
      "const output = {};",
      "\n\n",
      "for (const tc of testCases) {",
      "\n\t",
      `output[tc.id] = ${executeCode}(${parameters});`,
      "\n",
      "}",
      "\n\n",
      "console.log(JSON.stringify(output));",
    ];

    const command = [
      `${initializedTestCases}`,
      "\n\n",
      this.code,
      "\n\n",
      testCaseLoop.join(""),
    ];

    this.code = command.join("");

    return;
  }

  private async executeSandboxCode(): Promise<{
    stderr: string;
    stdout: string;
  }> {
    const file = this.getFile();

    if (!file) {
      throw new Error("No file created in the current instance.");
    }

    const sandbox = this.SANDBOXES[this.language];

    let processedCode: { stderr: string; stdout: string } = {
      stderr: "",
      stdout: "",
    };

    const runCommand = `docker run --rm -v ${this.SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${file}`;

    try {
      processedCode = await this.execAsync(runCommand, {
        timeout: 5000,
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });
    } catch (error: any) {
      processedCode.stderr = error.stderr ?? "Execution error";
    }

    return processedCode;
  }

  private async cleanupSandbox() {
    const file = this.getFile();

    if (!file) {
      throw new Error("No file created in the current instance.");
    }

    const command = `docker run --rm -v ${this.SANDBOX_CODE_VOLUME}:/data/code ${this.SANDBOX_CLEANER_IMAGE} rm code/${file}`;

    try {
      const { stderr, stdout } = await this.execAsync(command, {
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });

      return { stderr, stdout };
    } catch (error) {
      console.log(error);
    }
  }

  private generateTestCaseArray() {
    const sandbox = this.SANDBOXES[this.language];

    const parsedTestCases = this.parseTestCases();

    const testCasesInit = `${sandbox.testCaseInit} = ${parsedTestCases};`;

    return testCasesInit;
  }

  private parseTestCases() {
    const testCases = JSON.stringify(this.testCases, null, 2);

    switch (this.language) {
      case "javascript":
        return testCases;
      case "php":
        return `json_decode(${testCases}, true)`;
      default:
        return testCases;
    }
  }

  private setFile(file: string): void {
    this.file = file;
  }

  private getFile(): string | null {
    return this.file;
  }

  async compileAndRunCode() {
    this.generateCodeProcessor();

    this.createSandboxFile();

    const processedCode = await this.executeSandboxCode();

    await this.cleanupSandbox();

    return processedCode;
  }

  judgeOutput(output: string): Record<number, boolean> {
    const judgedOutput: Map<number, boolean> = new Map();

    let parsedOutput: object;

    try {
      parsedOutput = JSON.parse(output);
    } catch (error) {
      throw new Error("Output could not be validated.");
    }

    for (const [id, result] of Object.entries(parsedOutput)) {
      const matchingTestCase = this.testCases.find(
        (tc) => tc.id === Number(id),
      );

      if (!matchingTestCase) {
        throw new Error(`Test Case ${id} does not exist. Stopped code judge.`);
      }

      const expectedOutput = matchingTestCase.expected_output;

      let isMatched: boolean = true;

      if (typeof result === "object") {
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            if (result[i] !== expectedOutput[i]) {
              isMatched = false;
              break;
            }
          }
        } else {
          for (const [key, value] of Object.entries(result)) {
            if (expectedOutput[key as keyof typeof expectedOutput] !== value) {
              isMatched = false;
              break;
            }
          }
        }
      } else {
        isMatched = JSON.stringify(result) === JSON.stringify(expectedOutput);
      }

      judgedOutput.set(Number(id), isMatched);
    }

    return Object.fromEntries(judgedOutput);
  }
}

export { SandboxService };
