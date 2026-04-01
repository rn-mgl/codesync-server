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

    const command = `docker run --rm --network none -v ${this.SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox ${sandbox.image} ${sandbox.command} sandbox/${this.file}`;

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

    const command = `docker run --rm --network none -v ${this.SANDBOX_CODE_VOLUME}:/data/code ${this.SANDBOX_CLEANER_IMAGE} rm code/${this.file}`;

    try {
      const { stderr, stdout } = await this.execAsync(command, {
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });

      return { stderr, stdout };
    } catch (error) {
      console.log(error);
    }
  }

  private judgeOutput(
    testCaseOutput: string,
  ): Record<string, { result: boolean; memory: number }> {
    const judgedOutput: Map<string, { result: boolean; memory: number }> =
      new Map();

    let parsedTestCaseOutput: Record<
      string,
      {
        memory: {
          before: number;
          after: number;
        };
        result: unknown;
      }
    >;

    try {
      parsedTestCaseOutput = JSON.parse(testCaseOutput);
    } catch (error) {
      throw new Error("Output could not be validated.");
    }

    for (const [testCaseId, testCaseResult] of Object.entries(
      parsedTestCaseOutput,
    )) {
      const memoryResult = testCaseResult.memory;
      const functionOutput = testCaseResult.result;

      const memoryUsedBeforeMB = memoryResult.before / 1024 / 1024;
      const memoryUsedAterMB = memoryResult.after / 1024 / 1024;
      const totalMemoryUsed = memoryUsedAterMB - memoryUsedBeforeMB;

      let isMatched: boolean = true;

      const matchingTestCase = this.testCases.find(
        (tc) => tc.id === Number(testCaseId),
      );

      if (!matchingTestCase) {
        throw new Error(
          `Test Case ${testCaseId} does not exist. Stopped code judge.`,
        );
      }

      if (totalMemoryUsed > matchingTestCase.memory_limit_mb) {
        judgedOutput.set(testCaseId, {
          result: false,
          memory: totalMemoryUsed,
        });
        continue;
      }

      const expectedOutput = matchingTestCase.expected_output;
      const comparisonMethod = this.problem.output_format.comparison;

      if (typeof functionOutput === "object" && functionOutput !== null) {
        // for array
        if (Array.isArray(functionOutput)) {
          for (let i = 0; i < functionOutput.length; i++) {
            if (comparisonMethod.ordered) {
              if (functionOutput[i] !== expectedOutput[i]) {
                isMatched = false;
                break;
              }
            } else {
              if (!expectedOutput.includes(functionOutput[i])) {
                isMatched = false;
                break;
              }
            }
          }
        }
        // for object
        else {
          for (const [key, value] of Object.entries(functionOutput)) {
            if (expectedOutput[key as keyof typeof expectedOutput] !== value) {
              isMatched = false;
              break;
            }
          }
        }
      }
      // for primitive
      else {
        isMatched =
          JSON.stringify(functionOutput) === JSON.stringify(expectedOutput);
      }

      judgedOutput.set(testCaseId, {
        result: isMatched,
        memory: totalMemoryUsed,
      });
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
      `\toutput[tc.id] = {memory : {before : 0, after : 0}, result : {}};`,
      `\toutput[tc.id].memory.before = process.memoryUsage().heapUsed;`,
      `\toutput[tc.id].result = ${functionName}(${parameters});`,
      `\toutput[tc.id].memory.after = process.memoryUsage().heapUsed;`,
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
      `\t$output[$tc["id"]] = ["memory" => ["before" => 0, "after" => 0], "result" => []];`,
      `\t$output[$tc["id"]]["memory"]["before"] = memory_get_usage();`,
      `\t$output[$tc["id"]]["result"] = ${functionName}(${parameters});`,
      `\t$output[$tc["id"]]["memory"]["after"] = memory_get_usage();`,
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
