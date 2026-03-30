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
      return: "console.log(JSON.stringify(output))",
      initialize: {
        testCase: "const testCases",
        output: "const output = {};",
      },
      process: {
        record: "output[tc.id]",
      },
    },
    php: {
      command: "php",
      image: "php-sandbox-image",
      extension: "php",
      return: "echo json_encode($output)",
      initialize: {
        testCase: "$testCases",
        output: "$output = [];",
      },
      delimitter: {
        start: "<?php",
        end: "?>",
      },
      process: {
        record: `$output[$tc["id"]]`,
      },
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
    const sandbox = this.SANDBOXES[this.language];
    const outputContainer = sandbox.initialize.output;
    const returnOutput = sandbox.return;
    const initializedTestCases = this.generateTestCaseArray();

    const testCaseLoop = this.generateTestCaseLoop();

    const fullCode = [
      outputContainer,
      "\n\n",
      initializedTestCases,
      "\n\n",
      this.code,
      "\n\n",
      testCaseLoop,
      "\n\n",
      returnOutput,
    ];

    this.code = fullCode.join("");

    if (sandbox.delimitter) {
      const delimitted = `${sandbox.delimitter.start}\n\n${this.code}\n\n${sandbox.delimitter.end}`;
      this.code = delimitted;
    }

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

    const command = `docker run --rm -v ${this.SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${file}`;

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

    let testCases = JSON.stringify(this.testCases);

    switch (this.language) {
      case "javascript":
        break;
      case "php":
        testCases = `json_decode('${testCases}', true)`;
        break;
      default:
        return testCases;
    }

    const testCasesInit = `${sandbox.initialize.testCase} = ${testCases};`;

    return testCasesInit;
  }

  private generateTestCaseLoop() {
    const sandbox = this.SANDBOXES[this.language];
    const functionName = this.problem.input_format.name;
    const parameters = this.problem.input_format.params
      .map((p) => this.generateParameterVariable(p.name))
      .join(", ");
    const recordResult = sandbox.process.record;
    const executeCode = `${recordResult} = ${functionName}(${parameters});`;

    let forLoop: string[] = [];

    switch (this.language) {
      case "javascript":
        forLoop = [
          "for (const tc of testCases){",
          "\n\n",
          executeCode,
          "\n\n",
          "}",
        ];

        return forLoop.join("");
      case "php":
        forLoop = [
          "foreach ($testCases as $tc){",
          "\n\n",
          executeCode,
          "\n\n",
          "}",
        ];

        return forLoop.join("");
    }
  }

  private generateParameterVariable(param: string) {
    switch (this.language) {
      case "javascript":
        return `tc.input.${param}`;
      case "php":
        return `$tc["input"]["${param}"]`;
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
}

export { SandboxService };
