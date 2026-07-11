import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
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
  assert.match(output, /--from <format>/);
  assert.match(output, /--to <format>/);
  assert.match(output, /--output <file>/);
  assert.match(output, /--pretty/);
  assert.match(output, /--indent <number>/);
  assert.match(output, /--root-name <name>/);
  assert.match(output, /--sort-keys/);
  assert.match(output, /json, xml, yaml, toml, csv, tsv, ini,\s+env, markdown, html, query/);
  assert.doesNotMatch(output, /--columns <list>/);
  assert.doesNotMatch(output, /--delimiter <char>/);
  assert.doesNotMatch(output, /--no-header/);
  assert.doesNotMatch(output, /--nested <mode>/);
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

test("cli converts JSON file to TOML file", () => {
  const dir = mkdtempSync(join(tmpdir(), "polyconv-cli-test-"));
  const inputFile = join(dir, "input.json");
  const outputFile = join(dir, "output.toml");

  writeFileSync(inputFile, '{"name":"polyconv","config":{"enabled":true}}');

  execFileSync(
    process.execPath,
    ["dist/index.js", "convert", inputFile, "--to", "toml", "--output", outputFile],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: "pipe",
    }
  );

  const toml = readFileSync(outputFile, "utf-8");
  assert.match(toml, /name = "polyconv"/);
  assert.match(toml, /\[config\]/);
  assert.match(toml, /enabled = true/);
});

test("cli converts TOML file to JSON file by inferred source format", () => {
  const dir = mkdtempSync(join(tmpdir(), "polyconv-cli-test-"));
  const inputFile = join(dir, "input.toml");
  const outputFile = join(dir, "output.json");

  writeFileSync(inputFile, 'name = "polyconv"\n\n[config]\nenabled = true\n');

  execFileSync(
    process.execPath,
    ["dist/index.js", "convert", inputFile, "--to", "json", "--output", outputFile, "--sort-keys"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: "pipe",
    }
  );

  const json = readFileSync(outputFile, "utf-8");
  assert.equal(json, '{\n  "config": {\n    "enabled": true\n  },\n  "name": "polyconv"\n}');
});

test("cli supports JSON stdin to TOML stdout conversion with explicit source", () => {
  const output = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "toml"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '{"name":"polyconv"}',
    }
  );

  assert.match(output, /name = "polyconv"/);
});

test("cli supports TOML stdin to JSON-derived targets with explicit source", () => {
  const output = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "toml", "--to", "yaml"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: 'name = "polyconv"\nactive = true\n',
    }
  );

  assert.match(output, /name: polyconv/);
  assert.match(output, /active: true/);
});

test("cli supports new JSON conversion targets", () => {
  const tableInput = '[{"name":"Alice","age":30},{"name":"Bob","active":true}]';
  const objectInput = '{"NAME":"polyconv","PORT":3000,"config":{"enabled":true}}';

  const csv = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "csv"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: tableInput,
    }
  );
  assert.equal(csv, "name,age,active\nAlice,30,\nBob,,true\n\n");

  const tsv = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "tsv"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: tableInput,
    }
  );
  assert.equal(tsv, "name\tage\tactive\nAlice\t30\t\nBob\t\ttrue\n\n");

  const ini = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "ini"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: objectInput,
    }
  );
  assert.equal(ini, "NAME=polyconv\nPORT=3000\n\n[config]\nenabled=true\n\n");

  const env = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "env"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '{"NAME":"polyconv","PORT":3000}',
    }
  );
  assert.equal(env, "NAME=polyconv\nPORT=3000\n\n");

  const markdown = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "markdown"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: tableInput,
    }
  );
  assert.equal(
    markdown,
    "| name | age | active |\n| --- | --- | --- |\n| Alice | 30 |  |\n| Bob |  | true |\n\n"
  );

  const html = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "html"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '[{"name":"<Alice>"}]',
    }
  );
  assert.equal(
    html,
    "<table>\n<thead>\n<tr><th>name</th></tr>\n</thead>\n<tbody>\n<tr><td>&lt;Alice&gt;</td></tr>\n</tbody>\n</table>\n\n"
  );

  const query = execFileSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "query"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '{"q":"hello world","tag":["a","b"]}',
    }
  );
  assert.equal(query, "q=hello+world&tag=a&tag=b\n");
});

test("cli exits with code 1 for invalid target format", () => {
  const result = spawnSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "invalid"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '{"name":"polyconv"}',
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported target format: invalid/);
  assert.match(
    result.stderr,
    /Supported formats: json, xml, yaml, yml, toml, csv, tsv, ini, env, markdown, html, query/
  );
  assert.doesNotMatch(result.stderr, /format, minify/);
});

test("cli convert does not expose JSON utility targets", () => {
  const result = spawnSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "format"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: '{"name":"polyconv"}',
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported target format: format/);
  assert.doesNotMatch(result.stderr, /minify/);
});

test("cli exits with code 1 for invalid JSON input", () => {
  const result = spawnSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "json", "--to", "toml"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: "{invalid",
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Conversion Error: Failed to parse JSON/);
});

test("cli requires source format for stdin conversion", () => {
  const result = spawnSync(process.execPath, ["dist/index.js", "convert", "-", "--to", "toml"], {
    cwd: process.cwd(),
    encoding: "utf-8",
    input: '{"name":"polyconv"}',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Source format is required for stdin/);
});

test("cli rejects unsupported source formats", () => {
  const result = spawnSync(
    process.execPath,
    ["dist/index.js", "convert", "-", "--from", "yaml", "--to", "json"],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      input: "name: polyconv",
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported source format: yaml/);
});
