export const normalizeString = (s: string) => {
  // convert underscore to spaces
  if (s.includes("_")) {
    s = s
      .split("_")
      .map((word) => word.toUpperCase())
      .join(" ");
  }

  if (s.includes(".")) {
    s = s
      .split(".")
      .map((word) => word.toUpperCase())
      .join(" ");
  }

  return s;
};

export const memoryToMB = (memory: number) => {
  return memory / 1024 / 1024;
};

export const runtimeToMS = (runtime: number) => {
  return runtime / 1000;
};
