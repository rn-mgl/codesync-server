export const memoryToMB = (memory: number) => {
  return memory / 1024 / 1024;
};

export const runtimeToMS = (runtime: number) => {
  console.log(runtime / 1000);
  return runtime / 1000;
};

export const mapExitCode = (exitCode: number): string => {
  switch (exitCode) {
    case 0:
      return "Successful";
    case 1:
      return "Runtime Error Exception";
    case 124:
      return "Timeout Limit Exception";
    case 137:
      return "Memory Limit Exception";
    case 255:
      return "Error Exception";
  }
};
