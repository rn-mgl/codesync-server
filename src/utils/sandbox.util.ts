export const memoryToMb = (memory: number) => {
  return Number((memory / 1024 / 1024).toFixed(3));
};

export const runtimeToMs = (runtime: number) => {
  return Number((runtime / 1000).toFixed(3));
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
    default:
      return "Error Exception";
  }
};

export const mapExitSignal = (signal: string) => {
  switch (signal) {
    case "SIGKILL":
      return "Memory Limit Exception";
    case "SIGTERM":
      return "Timeout Limit Exception";
    default:
      return "Runtime Error Exception";
  }
};
