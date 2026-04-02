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
