import { env } from "@src/configs/env.config";
import type { BaseProblemData } from "@src/interface/problem.interface";
import type {
  ExecuteCodeOutput,
  JudgeOutput,
  SandboxData,
  SandboxServiceData,
} from "@src/interface/sandbox.interface";
import type { SupportedLanguages } from "@src/interface/submission.interface";
import type { BaseTestCaseData } from "@src/interface/test-case.interface";
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

type ExecError = {
  code?: number;
  signal?: string;
  stderr?: string;
  stdout?: string;
};

class SandboxService implements SandboxServiceData {
  code: string;
  language: SupportedLanguages;
  problem: BaseProblemData;
  testCases: BaseTestCaseData[];

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
    java: {
      command: "java -cp libs/gson.jar",
      image: "java-sandbox-image",
      extension: "java",
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

    const executedCode: {
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
    } catch (error) {
      console.log(error);
      const execError = error as ExecError;

      executedCode.signal = execError.signal || "";

      executedCode.stderr =
        execError.stderr || execError.stdout || "Execution error";

      executedCode.exitCode = execError.code || 1;
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

  private judgeOutput(executedCodeOutput: ExecuteCodeOutput): JudgeOutput {
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
      // expected_output is raw string, need to parse before comparing
      const problemOutputType = this.problem.output_format.type;
      const shouldParse = !["string", "void"].includes(problemOutputType);

      // literally can be any data type
      const expectedOutput: unknown = shouldParse
        ? JSON.parse(matchingTestCase.expected_output)
        : matchingTestCase.expected_output;

      const comparisonMethod = this.problem.output_format.comparison;

      const isTraversable =
        typeof functionOutput === "object" &&
        functionOutput !== null &&
        typeof expectedOutput === "object" &&
        expectedOutput !== null;

      if (isTraversable) {
        // for array
        if (Array.isArray(functionOutput) && Array.isArray(expectedOutput)) {
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

              // either the expected function output does not have all expected output
              const mismatchedExpectedOutput =
                expectedOutput.find(
                  (output) => !functionOutput.includes(output),
                ) !== undefined;

              // or the function output has something that is not in the expected output
              const mismatchedFunctionOutput =
                functionOutput.find(
                  (output) => !expectedOutput.includes(output),
                ) !== undefined;

              if (mismatchedExpectedOutput || mismatchedFunctionOutput) {
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
        isMatched = functionOutput === expectedOutput;
      }

      judgedOutput.output[testCaseId] = {
        matched: isMatched,
        memory: totalMemoryUsed,
        runtime: totalCpuUsage,
        result: functionOutput ?? null,
        logs: testCaseResult.logs,
      };
    }

    return judgedOutput;
  }

  private javascriptTemplate(): void {
    const functionName = this.problem.input_format.name;
    const methodName = this.problem.input_format.method ?? "solve";
    const isClassStyle = this.problem.input_format.style === "class";
    const parameters = this.problem.input_format.params
      .map((param) => this.javascriptParameter(param.name, param.type))
      .join(", ");
    const invocation = isClassStyle
      ? `new ${functionName}().${methodName}(${parameters})`
      : `${functionName}(${parameters})`;
    const resultExpression = this.isTreeNodeType(this.problem.output_format.type)
      ? `serializeTree(${invocation})`
      : invocation;
    const helperCode = this.usesTreeNode() ? this.javascriptTreeNodeHelper() : "";

    const codeLines = [
      `const output = {};`,
      `const testCases = ${JSON.stringify(this.testCases)};`,
      `let logs = [];`,
      `const logger = console.log;`,
      `console.log = (...args) => { args.forEach((arg) => logs.push(arg)); }`,
      helperCode,
      this.code,
      `for (const tc of testCases) {`,
      `\toutput[tc.id] = {memory : {before : 0, after : 0}, cpu : {before : 0, after : 0}, result : {}, logs : []};`,
      `\toutput[tc.id].memory.before = process.memoryUsage().heapUsed;`,
      `\tconst cpuBefore = process.cpuUsage();`,
      `\toutput[tc.id].cpu.before = cpuBefore.system + cpuBefore.user;`,
      `\toutput[tc.id].result = ${resultExpression};`,
      `\tif (logs.length) {`,
      `\t\toutput[tc.id].logs = logs;`,
      `\t}`,
      `\tconst cpuAfter = process.cpuUsage();`,
      `\toutput[tc.id].cpu.after = cpuAfter.system + cpuAfter.user;`,
      `\toutput[tc.id].memory.after = process.memoryUsage().heapUsed;`,
      `\tlogs = [];`,
      `}`,
      `logger(JSON.stringify(output));`,
      `process.exit();`,
    ];

    this.code = codeLines.join("\n\n");

    return;
  }

  private javascriptParameter(name: string, type: string): string {
    const value = `tc.input.${name}`;

    if (this.isTreeNodeType(type)) {
      return `buildTree(${value})`;
    }

    return value;
  }

  private javascriptTreeNodeHelper(): string {
    return [
      `class TreeNode {`,
      `\tconstructor(val = 0, left = null, right = null) {`,
      `\t\tthis.val = val;`,
      `\t\tthis.left = left;`,
      `\t\tthis.right = right;`,
      `\t}`,
      `}`,
      ``,
      `function buildTree(values) {`,
      `\tif (!Array.isArray(values) || values.length === 0 || values[0] === null || values[0] === undefined) {`,
      `\t\treturn null;`,
      `\t}`,
      ``,
      `\tconst root = new TreeNode(values[0]);`,
      `\tconst queue = [root];`,
      `\tlet i = 1;`,
      ``,
      `\twhile (queue.length && i < values.length) {`,
      `\t\tconst node = queue.shift();`,
      ``,
      `\t\tif (values[i] !== null && values[i] !== undefined) {`,
      `\t\t\tnode.left = new TreeNode(values[i]);`,
      `\t\t\tqueue.push(node.left);`,
      `\t\t}`,
      `\t\ti++;`,
      ``,
      `\t\tif (i < values.length && values[i] !== null && values[i] !== undefined) {`,
      `\t\t\tnode.right = new TreeNode(values[i]);`,
      `\t\t\tqueue.push(node.right);`,
      `\t\t}`,
      `\t\ti++;`,
      `\t}`,
      ``,
      `\treturn root;`,
      `}`,
      ``,
      `function serializeTree(root) {`,
      `\tif (!root) {`,
      `\t\treturn [];`,
      `\t}`,
      ``,
      `\tconst values = [];`,
      `\tconst queue = [root];`,
      ``,
      `\twhile (queue.length) {`,
      `\t\tconst node = queue.shift();`,
      ``,
      `\t\tif (!node) {`,
      `\t\t\tvalues.push(null);`,
      `\t\t\tcontinue;`,
      `\t\t}`,
      ``,
      `\t\tvalues.push(node.val);`,
      `\t\tqueue.push(node.left);`,
      `\t\tqueue.push(node.right);`,
      `\t}`,
      ``,
      `\twhile (values.length && values[values.length - 1] === null) {`,
      `\t\tvalues.pop();`,
      `\t}`,
      ``,
      `\treturn values;`,
      `}`,
    ].join("\n");
  }

  private phpTemplate(): void {
    const functionName = this.problem.input_format.name;
    const methodName = this.problem.input_format.method ?? "solve";
    const isClassStyle = this.problem.input_format.style === "class";
    const parameters = this.problem.input_format.params
      .map((param) => this.phpParameter(param.name, param.type))
      .join(", ");
    const invocation = isClassStyle
      ? `(new ${functionName}())->${methodName}(${parameters})`
      : `${functionName}(${parameters})`;
    const resultExpression = this.isTreeNodeType(this.problem.output_format.type)
      ? `serializeTree(${invocation})`
      : invocation;
    const helperCode = this.usesTreeNode() ? this.phpTreeNodeHelper() : "";

    const codeLines = [
      `<?php`,
      `$output = [];`,
      `$testCases = json_decode('${JSON.stringify(this.testCases)}', true);`,
      helperCode,
      this.stripPhpTags(this.code),
      `foreach ($testCases as $tc) {`,
      `\t$output[$tc["id"]] = ["memory" => ["before" => 0, "after" => 0], "cpu" => ["before" => 0, "after" => 0], "result" => [], "logs" => []];`,
      `\t$output[$tc["id"]]["memory"]["before"] = memory_get_usage();`,
      `\t$cpuBefore = getrusage();`,
      `\t$output[$tc["id"]]["cpu"]["before"] = $cpuBefore["ru_utime.tv_usec"] + $cpuBefore["ru_stime.tv_usec"];`,
      `\tob_start();`,
      `\t$output[$tc["id"]]["result"] = ${resultExpression};`,
      `\t$buffer = ob_get_clean();`,
      `\tif ($buffer !== '') {`,
      `\t\t$output[$tc["id"]]["logs"][] = $buffer;`,
      `\t}`,
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

  private phpParameter(name: string, type: string): string {
    const value = `$tc["input"]["${name}"]`;

    if (this.isTreeNodeType(type)) {
      return `buildTree(${value})`;
    }

    return value;
  }

  private phpTreeNodeHelper(): string {
    return [
      `class TreeNode {`,
      `\tpublic $val;`,
      `\tpublic $left;`,
      `\tpublic $right;`,
      ``,
      `\tpublic function __construct($val = 0, $left = null, $right = null) {`,
      `\t\t$this->val = $val;`,
      `\t\t$this->left = $left;`,
      `\t\t$this->right = $right;`,
      `\t}`,
      `}`,
      ``,
      `function buildTree($values) {`,
      `\tif (!is_array($values) || count($values) === 0 || $values[0] === null) {`,
      `\t\treturn null;`,
      `\t}`,
      ``,
      `\t$root = new TreeNode($values[0]);`,
      `\t$queue = [$root];`,
      `\t$i = 1;`,
      ``,
      `\twhile (count($queue) > 0 && $i < count($values)) {`,
      `\t\t$node = array_shift($queue);`,
      ``,
      `\t\tif ($values[$i] !== null) {`,
      `\t\t\t$node->left = new TreeNode($values[$i]);`,
      `\t\t\t$queue[] = $node->left;`,
      `\t\t}`,
      `\t\t$i++;`,
      ``,
      `\t\tif ($i < count($values) && $values[$i] !== null) {`,
      `\t\t\t$node->right = new TreeNode($values[$i]);`,
      `\t\t\t$queue[] = $node->right;`,
      `\t\t}`,
      `\t\t$i++;`,
      `\t}`,
      ``,
      `\treturn $root;`,
      `}`,
      ``,
      `function serializeTree($root) {`,
      `\tif ($root === null) {`,
      `\t\treturn [];`,
      `\t}`,
      ``,
      `\t$values = [];`,
      `\t$queue = [$root];`,
      ``,
      `\twhile (count($queue) > 0) {`,
      `\t\t$node = array_shift($queue);`,
      ``,
      `\t\tif ($node === null) {`,
      `\t\t\t$values[] = null;`,
      `\t\t\tcontinue;`,
      `\t\t}`,
      ``,
      `\t\t$values[] = $node->val;`,
      `\t\t$queue[] = $node->left;`,
      `\t\t$queue[] = $node->right;`,
      `\t}`,
      ``,
      `\twhile (count($values) > 0 && $values[count($values) - 1] === null) {`,
      `\t\tarray_pop($values);`,
      `\t}`,
      ``,
      `\treturn $values;`,
      `}`,
    ].join("\n");
  }

  private stripPhpTags(code: string): string {
    return code
      .replace(/^\s*<\?(?:php)?/i, "")
      .replace(/\?>\s*$/i, "")
      .trim();
  }

  private javaTemplate(): void {
    const functionName = this.problem.input_format.name;
    const methodName = this.problem.input_format.method ?? "solve";
    const isClassStyle = this.problem.input_format.style === "class";
    const parameters = this.problem.input_format.params
      .map((param) => this.javaParameter(param.name, param.type))
      .join(", ");
    const invocation = isClassStyle
      ? `new ${functionName}().${methodName}(${parameters})`
      : `${functionName}(${parameters})`;
    const resultExpression = this.isTreeNodeType(this.problem.output_format.type)
      ? `serializeTree(${invocation})`
      : invocation;
    const helperCode = this.usesTreeNode() ? this.javaTreeNodeHelper() : "";
    const { imports, code } = this.extractJavaImports(this.code);

    const importLines = [
      `import com.google.gson.Gson;`,
      `import com.google.gson.JsonElement;`,
      `import com.google.gson.reflect.TypeToken;`,
      `import java.io.ByteArrayOutputStream;`,
      `import java.io.PrintStream;`,
      `import java.lang.management.ManagementFactory;`,
      `import java.lang.management.ThreadMXBean;`,
      `import java.util.ArrayList;`,
      `import java.util.LinkedHashMap;`,
      `import java.util.List;`,
      `import java.util.Map;`,
      ...imports,
    ];

    const codeLines = [
      ...new Set(importLines),
      ``,
      `class Main {`,
      `\tprivate static final Gson gson = new Gson();`,
      `\tprivate static final Runtime runtime = Runtime.getRuntime();`,
      `\tprivate static final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();`,
      ``,
      `\tstatic class TestCase {`,
      `\t\tint id;`,
      `\t\tMap<String, JsonElement> input;`,
      `\t}`,
      ``,
      `\tprivate static long usedMemory() {`,
      `\t\treturn runtime.totalMemory() - runtime.freeMemory();`,
      `\t}`,
      ``,
      `\tprivate static long usedCpu() {`,
      `\t\tif (threadBean.isCurrentThreadCpuTimeSupported()) {`,
      `\t\t\treturn threadBean.getCurrentThreadCpuTime() / 1000;`,
      `\t\t}`,
      ``,
      `\t\treturn System.nanoTime() / 1000;`,
      `\t}`,
      ``,
      helperCode,
      ``,
      code,
      ``,
      `\tpublic static void main(String[] args) {`,
      `\t\tMap<Integer, Object> output = new LinkedHashMap<>();`,
      `\t\tTestCase[] testCases = gson.fromJson("""`,
      JSON.stringify(this.testCases).replaceAll(`"""`, `\\"""`),
      `\t\t""", TestCase[].class);`,
      `\t\tPrintStream logger = System.out;`,
      ``,
      `\t\tfor (TestCase tc : testCases) {`,
      `\t\t\tMap<String, Object> result = new LinkedHashMap<>();`,
      `\t\t\tMap<String, Long> memory = new LinkedHashMap<>();`,
      `\t\t\tMap<String, Long> cpu = new LinkedHashMap<>();`,
      `\t\t\tList<String> logs = new ArrayList<>();`,
      ``,
      `\t\t\tmemory.put("before", usedMemory());`,
      `\t\t\tcpu.put("before", usedCpu());`,
      ``,
      `\t\t\tByteArrayOutputStream buffer = new ByteArrayOutputStream();`,
      `\t\t\tPrintStream capture = new PrintStream(buffer);`,
      `\t\t\tSystem.setOut(capture);`,
      `\t\t\tObject functionOutput;`,
      ``,
      `\t\t\ttry {`,
      `\t\t\t\tfunctionOutput = ${resultExpression};`,
      `\t\t\t} finally {`,
      `\t\t\t\tcapture.flush();`,
      `\t\t\t\tSystem.setOut(logger);`,
      `\t\t\t}`,
      ``,
      `\t\t\tString capturedLogs = buffer.toString();`,
      `\t\t\tif (!capturedLogs.isEmpty()) {`,
      `\t\t\t\tlogs.add(capturedLogs);`,
      `\t\t\t}`,
      ``,
      `\t\t\tcpu.put("after", usedCpu());`,
      `\t\t\tmemory.put("after", usedMemory());`,
      ``,
      `\t\t\tresult.put("memory", memory);`,
      `\t\t\tresult.put("cpu", cpu);`,
      `\t\t\tresult.put("result", functionOutput);`,
      `\t\t\tresult.put("logs", logs);`,
      `\t\t\toutput.put(tc.id, result);`,
      `\t\t}`,
      ``,
      `\t\tlogger.println(gson.toJson(output));`,
      `\t}`,
      `}`,
    ];

    this.code = codeLines.join("\n");

    return;
  }

  private javaParameter(name: string, type: string): string {
    const value = `gson.fromJson(tc.input.get("${name}"), ${this.javaTypeReference(type)})`;

    if (this.isTreeNodeType(type)) {
      return `buildTree(${value})`;
    }

    return value;
  }

  private javaTreeNodeHelper(): string {
    return [
      `\tstatic class TreeNode {`,
      `\t\tint val;`,
      `\t\tTreeNode left;`,
      `\t\tTreeNode right;`,
      ``,
      `\t\tTreeNode(int val) {`,
      `\t\t\tthis.val = val;`,
      `\t\t}`,
      `\t}`,
      ``,
      `\tprivate static TreeNode buildTree(Integer[] values) {`,
      `\t\tif (values == null || values.length == 0 || values[0] == null) {`,
      `\t\t\treturn null;`,
      `\t\t}`,
      ``,
      `\t\tTreeNode root = new TreeNode(values[0]);`,
      `\t\tList<TreeNode> queue = new ArrayList<>();`,
      `\t\tqueue.add(root);`,
      `\t\tint cursor = 0;`,
      `\t\tint i = 1;`,
      ``,
      `\t\twhile (cursor < queue.size() && i < values.length) {`,
      `\t\t\tTreeNode node = queue.get(cursor++);`,
      ``,
      `\t\t\tif (values[i] != null) {`,
      `\t\t\t\tnode.left = new TreeNode(values[i]);`,
      `\t\t\t\tqueue.add(node.left);`,
      `\t\t\t}`,
      `\t\t\ti++;`,
      ``,
      `\t\t\tif (i < values.length && values[i] != null) {`,
      `\t\t\t\tnode.right = new TreeNode(values[i]);`,
      `\t\t\t\tqueue.add(node.right);`,
      `\t\t\t}`,
      `\t\t\ti++;`,
      `\t\t}`,
      ``,
      `\t\treturn root;`,
      `\t}`,
      ``,
      `\tprivate static List<Integer> serializeTree(TreeNode root) {`,
      `\t\tList<Integer> values = new ArrayList<>();`,
      ``,
      `\t\tif (root == null) {`,
      `\t\t\treturn values;`,
      `\t\t}`,
      ``,
      `\t\tList<TreeNode> queue = new ArrayList<>();`,
      `\t\tqueue.add(root);`,
      `\t\tint cursor = 0;`,
      ``,
      `\t\twhile (cursor < queue.size()) {`,
      `\t\t\tTreeNode node = queue.get(cursor++);`,
      ``,
      `\t\t\tif (node == null) {`,
      `\t\t\t\tvalues.add(null);`,
      `\t\t\t\tcontinue;`,
      `\t\t\t}`,
      ``,
      `\t\t\tvalues.add(node.val);`,
      `\t\t\tqueue.add(node.left);`,
      `\t\t\tqueue.add(node.right);`,
      `\t\t}`,
      ``,
      `\t\twhile (!values.isEmpty() && values.get(values.size() - 1) == null) {`,
      `\t\t\tvalues.remove(values.size() - 1);`,
      `\t\t}`,
      ``,
      `\t\treturn values;`,
      `\t}`,
    ].join("\n");
  }

  private extractJavaImports(code: string): {
    imports: string[];
    code: string;
  } {
    const imports: string[] = [];
    const codeLines: string[] = [];

    for (const line of code.split("\n")) {
      const trimmedLine = line.trim();

      if (/^import\s+(?:static\s+)?[\w.*]+;$/.test(trimmedLine)) {
        imports.push(trimmedLine);
        continue;
      }

      codeLines.push(line);
    }

    return { imports, code: codeLines.join("\n").trim() };
  }

  private javaTypeReference(type: string): string {
    const normalized = type.toLowerCase().replace(/\s+/g, "");

    const primitiveTypes: Record<string, string> = {
      int: "Integer.class",
      integer: "Integer.class",
      long: "Long.class",
      number: "Integer.class",
      double: "Double.class",
      float: "Float.class",
      boolean: "Boolean.class",
      bool: "Boolean.class",
      string: "String.class",
      char: "Character.class",
      character: "Character.class",
      object: "Object.class",
    };

    const arrayTypes: Record<string, string> = {
      "int[]": "int[].class",
      "integer[]": "Integer[].class",
      "long[]": "long[].class",
      "number[]": "int[].class",
      "double[]": "double[].class",
      "float[]": "float[].class",
      "boolean[]": "boolean[].class",
      "bool[]": "Boolean[].class",
      "string[]": "String[].class",
      "char[]": "char[].class",
      "character[]": "Character[].class",
      treenode: "Integer[].class",
    };

    if (primitiveTypes[normalized]) {
      return primitiveTypes[normalized];
    }

    if (arrayTypes[normalized]) {
      return arrayTypes[normalized];
    }

    if (normalized.startsWith("list<") || normalized.startsWith("array<")) {
      const itemType = normalized.slice(normalized.indexOf("<") + 1, -1);
      const listType = this.javaCollectionType(itemType);

      return `new TypeToken<List<${listType}>>() {}.getType()`;
    }

    return "Object.class";
  }

  private usesTreeNode(): boolean {
    return (
      this.isTreeNodeType(this.problem.output_format.type) ||
      this.problem.input_format.params.some((param) =>
        this.isTreeNodeType(param.type),
      )
    );
  }

  private isTreeNodeType(type: string): boolean {
    return type.toLowerCase().replace(/\s+/g, "") === "treenode";
  }

  private javaCollectionType(type: string): string {
    const normalized = type.toLowerCase().replace(/\s+/g, "");

    const collectionTypes: Record<string, string> = {
      int: "Integer",
      integer: "Integer",
      long: "Long",
      number: "Integer",
      double: "Double",
      float: "Float",
      boolean: "Boolean",
      bool: "Boolean",
      string: "String",
      char: "Character",
      character: "Character",
      object: "Object",
    };

    if (collectionTypes[normalized]) {
      return collectionTypes[normalized];
    }

    if (normalized.endsWith("[]")) {
      const itemType = normalized.slice(0, -2);

      return `${this.javaCollectionType(itemType)}[]`;
    }

    if (normalized.startsWith("list<") || normalized.startsWith("array<")) {
      const itemType = normalized.slice(normalized.indexOf("<") + 1, -1);

      return `List<${this.javaCollectionType(itemType)}>`;
    }

    return "Object";
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
      case "java":
        this.javaTemplate();
        break;
    }

    // create file for generated code template
    this.createSandboxFile();

    // execute the said file
    const executedCode = await this.executeSandboxCode();

    // cleanup sandbox
    await this.cleanupSandbox();

    // throw errors if necessary
    if (executedCode.stderr || executedCode.exitCode > 0) {
      const mappedExitCode = mapExitCode(executedCode.exitCode);
      const mappedExitSignal = mapExitSignal(executedCode.signal);

      const errorMessage = `${mappedExitCode || mappedExitSignal}\n\n${executedCode.stderr}`;

      const judgeError: JudgeOutput = {
        success: false,
        error: "runtime_error",
        message: errorMessage.trim(),
      };

      return judgeError;
    }

    // get and parse output
    let stdoutData: ExecuteCodeOutput;

    try {
      stdoutData = JSON.parse(executedCode.stdout);
    } catch (error) {
      console.log(error);
      throw new Error("Output could not be validated.");
    }

    // validate result
    const judged = this.judgeOutput(stdoutData);

    return judged;
  }
}

export { SandboxService };
