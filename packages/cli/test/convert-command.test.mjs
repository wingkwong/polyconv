import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

test("cli help includes convert command and options", () => {
  const output = execFileSync(process.execPath, ["dist/index.js", "convert", "--help"], {
    cwd: process.cwd(),
    encoding: "utf-8",
  });

  assert.match(output, /Usage: polyconv convert/);
  assert.match(output, /--to <format>/);
  assert.match(output, /--output <file>/);
  assert.match(output, /--pretty/);
  assert.match(output, /--indent <number>/);
  assert.match(output, /--root-name <name>/);
  assert.match(output, /--sort-keys/);
});

test("cli supports dedicated format command without --to", () => {
  const helpOutput = execFileSync(process.execPath, ["dist/index.js", "format", "--help"], {
    cwd: process.cwd(),
    encoding: "utf-8",
  });

  assert.match(helpOutput, /Usage: polyconv format/);
  assert.doesNotMatch(helpOutput, /--to <format>/);

  const dir = mkdtempSync(join(tmpdir(), "polyconv-cli-test-"));
  const inputFile = join(dir, "input.json");
  const outputFile = join(dir, "formatted.json");

  writeFileSync(inputFile, '{"b":2,"a":1}');

  execFileSync(
    process.execPath,
    ["dist/index.js", "format", inputFile, "--indent", "2", "--sort-keys", "--output", outputFile],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: "pipe",
    }
  );

  const formatted = readFileSync(outputFile, "utf-8");
  assert.equal(formatted, '{\n  "a": 1,\n  "b": 2\n}');
});

test("cli supports dedicated minify command without --to", () => {
  const helpOutput = execFileSync(process.execPath, ["dist/index.js", "minify", "--help"], {
    cwd: process.cwd(),
    encoding: "utf-8",
  });

  assert.match(helpOutput, /Usage: polyconv minify/);
  assert.doesNotMatch(helpOutput, /--to <format>/);

  const dir = mkdtempSync(join(tmpdir(), "polyconv-cli-test-"));
  const inputFile = join(dir, "input.json");
  const outputFile = join(dir, "minified.json");

  writeFileSync(inputFile, '{ "a": 1, "b": [1, 2] }');

  execFileSync(process.execPath, ["dist/index.js", "minify", inputFile, "--output", outputFile], {
    cwd: process.cwd(),
    encoding: "utf-8",
    stdio: "pipe",
  });

  const minified = readFileSync(outputFile, "utf-8");
  assert.equal(minified, '{"a":1,"b":[1,2]}');
});
