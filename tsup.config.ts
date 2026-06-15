import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/services/worker.service.ts"],
  outDir: "dist",
  format: ["esm"],
  clean: true,
});
