import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: "esnext",
  skipNodeModulesBundle: true,
  external: ["@polyconv/core", "@polyconv/json"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
