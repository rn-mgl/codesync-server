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
    },
    php: {
      command: "php",
      image: "php-sandbox-image",
      extension: "php",
    },
  } as const;

  constructor(data: SandboxServiceData) {
    this.code = data.code;
    this.language = data.language;
    this.problem = data.problem;
    this.testCases = data.testCases;
  }

  private createSandboxFile(): void {
    const uuid = randomUUID();

    const sandbox = this.SANDBOXES[this.language];

    const fileName = `${this.language}_${uuid}.${sandbox.extension}`;

    const path = `./sandbox/${fileName}`;

    fs.writeFileSync(path, this.code);

    this.file = fileName;

    return;
  }

  private async executeSandboxCode(): Promise<{
    stderr: string;
    stdout: string;
  }> {
    if (!this.file) {
      throw new Error("No file created in the current instance.");
    }

    const sandbox = this.SANDBOXES[this.language];

    let processedCode: { stderr: string; stdout: string } = {
      stderr: "",
      stdout: "",
    };

    const command = `docker run --rm -v ${this.SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${this.file}`;

    try {
      processedCode = await this.execAsync(command, {
        timeout: 5000,
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });
    } catch (error: any) {
      processedCode.stderr = error.stderr ?? "Execution error";
    }

    return processedCode;
  }

  private async cleanupSandbox() {
    if (!this.file) {
      throw new Error("No file created in the current instance.");
    }

    const command = `docker run --rm -v ${this.SANDBOX_CODE_VOLUME}:/data/code ${this.SANDBOX_CLEANER_IMAGE} rm code/${this.file}`;

    try {
      const { stderr, stdout } = await this.execAsync(command, {
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });

      return { stderr, stdout };
    } catch (error) {
      console.log(error);
    }
  }

  private judgeOutput(output: string): Record<number, boolean> {
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
      const comparisonMethod = this.problem.output_format.comparison;

      let isMatched: boolean = true;

      if (typeof result === "object") {
        // for array
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            if (comparisonMethod.ordered) {
              if (result[i] !== expectedOutput[i]) {
                isMatched = false;
                break;
              }
            } else {
              if (!expectedOutput.includes(result[i])) {
                isMatched = false;
                break;
              }
            }
          }
        }
        // for object
        else {
          for (const [key, value] of Object.entries(result)) {
            if (expectedOutput[key as keyof typeof expectedOutput] !== value) {
              isMatched = false;
              break;
            }
          }
        }
      }
      // for primitive
      else {
        isMatched = JSON.stringify(result) === JSON.stringify(expectedOutput);
      }

      judgedOutput.set(Number(id), isMatched);
    }

    return Object.fromEntries(judgedOutput);
  }

  private javascriptTemplate() {
    const functionName = this.problem.input_format.name;
    const parameters = this.problem.input_format.params
      .map((param) => `tc.input.${param.name}`)
      .join(", ");

    const codeLines = [
      `const output = {};`,
      `const testCases = ${JSON.stringify(this.testCases)};`,
      this.code,
      `for (const tc of testCases) {`,
      `\toutput[tc.id] = ${functionName}(${parameters});`,
      `}`,
      `console.log(JSON.stringify(output));`,
    ];

    this.code = codeLines.join("\n\n");

    return;
  }

  private phpTemplate() {
    const functionName = this.problem.input_format.name;
    const parameters = this.problem.input_format.params
      .map((param) => `$tc["input"]["${param.name}"]`)
      .join(", ");

    const codeLines = [
      `<?php`,
      `$output = [];`,
      `$testCases = json_decode('${JSON.stringify(this.testCases)}', true);`,
      this.code,
      `foreach ($testCases as $tc) {`,
      `\t$output[$tc["id"]] = ${functionName}(${parameters});`,
      `}`,
      `echo json_encode($output);`,
      `?>`,
    ];

    this.code = codeLines.join("\n\n");

    return;
  }

  async compileAndRunCode() {
    // generate code template
    switch (this.language) {
      case "javascript":
        this.javascriptTemplate();
        break;
      case "php":
        this.phpTemplate();
        break;
    }

    // create file for generated code template
    this.createSandboxFile();

    // execute the said file
    const processedCode = await this.executeSandboxCode();

    // throw errors if necessary
    if (processedCode.stderr) {
      throw new Error(`Code did not run successfully. ${processedCode.stderr}`);
    }

    // cleanup sandbox
    await this.cleanupSandbox();

    // validate result
    const judged = this.judgeOutput(processedCode.stdout);

    return judged;
  }
}

export { SandboxService };
