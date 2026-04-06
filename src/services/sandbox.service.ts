import { env } from "@src/configs/env.config";
import type { FullProblemData } from "@src/interface/problem.interface";
import type {
  JudgeOutput,
  SandboxData,
  SandboxServiceData,
  TestCaseOutput,
} from "@src/interface/sandbox.interface";
import type { SupportedLanguages } from "@src/interface/submission.interface";
import type { FullTestCaseData } from "@src/interface/test-case.interface";
import {
  mapExitCode,
  mapExitSignal,
  memoryToMb,
  runtimeToMs,
} from "@src/utils/sandbox.util";
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
    signal: string;
    exitCode: number;
  }> {
    if (!this.file) {
      throw new Error("No file created in the current instance.");
    }

    const sandbox = this.SANDBOXES[this.language];

    let executedCode: {
      stderr: string;
      stdout: string;
      signal: string;
      exitCode: number;
    } = {
      stderr: "",
      stdout: "",
      signal: "",
      exitCode: 0,
    };

    const commandLines = [
      `timeout 2s`,
      `docker run --rm`,
      `--network none`,
      `--memory 128m`,
      `--cpus 1`,
      `-v ${this.SANDBOX_CODE_VOLUME}:/usr/src/app/sandbox`,
      sandbox.image,
      sandbox.command,
      `sandbox/${this.file}`,
    ];

    const command = commandLines.join(" ");

    try {
      const output = await this.execAsync(command, {
        timeout: 5000,
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });

      executedCode.stdout = output.stdout;
      executedCode.stderr = output.stderr;
      executedCode.exitCode = 0;
    } catch (error: any) {
      console.log(error);
      executedCode.signal = error?.signal ?? "";
      executedCode.stderr = error?.stderr ?? error?.stdout ?? "Execution error";
      executedCode.exitCode = error?.code ?? 1;
    }

    return executedCode;
  }

  private async cleanupSandbox() {
    if (!this.file) {
      throw new Error("No file created in the current instance.");
    }

    const commandLines = [
      `docker run --rm`,
      `--network none`,
      `-v ${this.SANDBOX_CODE_VOLUME}:/data/code`,
      this.SANDBOX_CLEANER_IMAGE,
      `rm code/${this.file}`,
    ];

    const command = commandLines.join(" ");

    try {
      const { stderr, stdout } = await this.execAsync(command, {
        env: { DOCKER_API_VERSION: env.DOCKER_API_VERSION },
      });

      return { stderr, stdout };
    } catch (error) {
      console.log(error);
    }
  }

  private judgeOutput(executedCodeOutput: TestCaseOutput): JudgeOutput {
    const judgedOutput: JudgeOutput = { success: true, output: {} };

    for (const [testCaseId, testCaseResult] of Object.entries(
      executedCodeOutput,
    )) {
      const memoryResult = testCaseResult.memory;
      const cpuResult = testCaseResult.cpu;
      const functionOutput = testCaseResult.result;

      const memoryUsedBefore = memoryToMb(memoryResult.before);
      const memoryUsedAfter = memoryToMb(memoryResult.after);
      const totalMemoryUsed = memoryUsedAfter - memoryUsedBefore;

      const cpuUsageBefore = runtimeToMs(cpuResult.before);
      const cpuUsageAfter = runtimeToMs(cpuResult.after);
      const totalCpuUsage = cpuUsageAfter - cpuUsageBefore;

      let isMatched: boolean = true;

      const matchingTestCase = this.testCases.find(
        (tc) => tc.id === Number(testCaseId),
      );

      if (!matchingTestCase) {
        const judgeError: JudgeOutput = {
          success: false,
          error: "compilation_error",
          message: `Test Case ${testCaseId} does not exist. Stopped code judge.`,
        };

        return judgeError;
      }

      if (totalMemoryUsed > matchingTestCase.memory_limit_mb) {
        const judgeError: JudgeOutput = {
          success: false,
          error: "memory_limit_exceeded",
          message: `Memory Limit Exception | Test Case ${testCaseId}}`,
        };

        return judgeError;
      }

      if (totalCpuUsage > matchingTestCase.time_limit_ms) {
        const judgeError: JudgeOutput = {
          success: false,
          error: "time_limit_exceeded",
          message: `Time Limit Exception | Test Case ${testCaseId}`,
        };

        return judgeError;
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

      judgedOutput.output[testCaseId] = {
        matched: isMatched,
        memory: totalMemoryUsed,
        run_time: totalCpuUsage,
        result: functionOutput ?? null,
      };
    }

    return judgedOutput;
  }

  private javascriptTemplate(): void {
    const functionName = this.problem.input_format.name;
    const parameters = this.problem.input_format.params
      .map((param) => `tc.input.${param.name}`)
      .join(", ");

    const codeLines = [
      `const output = {};`,
      `const testCases = ${JSON.stringify(this.testCases)};`,
      this.code,
      `for (const tc of testCases) {`,
      `\toutput[tc.id] = {memory : {before : 0, after : 0}, cpu : {before : 0, after : 0}, result : {}};`,
      `\toutput[tc.id].memory.before = process.memoryUsage().heapUsed;`,
      `\tconst cpuBefore = process.cpuUsage();`,
      `\toutput[tc.id].cpu.before = cpuBefore.system + cpuBefore.user;`,
      `\toutput[tc.id].result = ${functionName}(${parameters});`,
      `\tconst cpuAfter = process.cpuUsage();`,
      `\toutput[tc.id].cpu.after = cpuAfter.system + cpuAfter.user;`,
      `\toutput[tc.id].memory.after = process.memoryUsage().heapUsed;`,
      `}`,
      `console.log(JSON.stringify(output));`,
      `process.exit();`,
    ];

    this.code = codeLines.join("\n\n");

    return;
  }

  private phpTemplate(): void {
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
      `\t$output[$tc["id"]] = ["memory" => ["before" => 0, "after" => 0], "cpu" => ["before" => 0, "after" => 0], "result" => []];`,
      `\t$output[$tc["id"]]["memory"]["before"] = memory_get_usage();`,
      `\t$cpuBefore = getrusage();`,
      `\t$output[$tc["id"]]["cpu"]["before"] = $cpuBefore["ru_utime.tv_usec"] + $cpuBefore["ru_stime.tv_usec"];`,
      `\t$output[$tc["id"]]["result"] = ${functionName}(${parameters});`,
      `\t$cpuAfter = getrusage();`,
      `\t$output[$tc["id"]]["cpu"]["after"] = $cpuAfter["ru_utime.tv_usec"] + $cpuAfter["ru_stime.tv_usec"];`,
      `\t$output[$tc["id"]]["memory"]["after"] = memory_get_usage();`,
      `}`,
      `echo json_encode($output);`,
      `exit();`,
      `?>`,
    ];

    this.code = codeLines.join("\n\n");

    return;
  }

  async compileAndRunCode(): Promise<JudgeOutput> {
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
    const executedCode = await this.executeSandboxCode();

    // throw errors if necessary
    if (executedCode.stderr || executedCode.exitCode > 0) {
      const mappedExitCode = mapExitCode(executedCode.exitCode);
      const mappedExitSignal = mapExitSignal(executedCode.signal);

      const errorMessage = `${mappedExitCode || mappedExitSignal}\n\n${executedCode.stderr}`;

      const judgeError: JudgeOutput = {
        success: false,
        error: "runtime_error",
        message: errorMessage,
      };

      return judgeError;
    }

    // get and parse output
    let stdoutData: TestCaseOutput;

    try {
      stdoutData = JSON.parse(executedCode.stdout);
    } catch (error) {
      throw new Error("Output could not be validated.");
    }

    // cleanup sandbox
    await this.cleanupSandbox();

    // validate result
    const judged = this.judgeOutput(stdoutData);

    return judged;
  }
}

export { SandboxService };
