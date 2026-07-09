import { BaseConverter, ConversionError, validateNotEmpty } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";

export interface TomlToJsonOptions extends ConversionOptions {
  /**
   * Whether to sort object keys
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for TOML to JSON format
 */
export class TomlToJsonConverter extends BaseConverter<string, string, TomlToJsonOptions> {
  readonly sourceFormat = "toml";
  readonly targetFormat = "json";

  convert(input: string, options: TomlToJsonOptions = {}): ConversionResult<string> {
    validateNotEmpty(input, this.sourceFormat);

    try {
      const tomlData = parseToml(input, this.sourceFormat, this.targetFormat);
      const data = options.sortKeys ? sortObjectKeys(tomlData) : tomlData;
      const json = JSON.stringify(data, null, options.pretty ? (options.indent ?? 2) : 0);

      return this.createResult(json, {
        options: {
          pretty: options.pretty ?? false,
          indent: options.indent ?? 2,
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      throw new ConversionError("Failed to convert TOML to JSON", {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  validate(input: string): boolean {
    try {
      validateNotEmpty(input, this.sourceFormat);
      parseToml(input, this.sourceFormat, this.targetFormat);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convert TOML string to JSON
 */
export function tomlToJson(input: string, options?: TomlToJsonOptions): string {
  const converter = new TomlToJsonConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = sortObjectKeys(value[key]);
      return sorted;
    }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseToml(
  input: string,
  sourceFormat: string,
  targetFormat: string
): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  let currentTable = root;

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = stripComment(rawLine).trim();

    if (line.length === 0) {
      return;
    }

    if (line.startsWith("[") && line.endsWith("]")) {
      const tablePath = line.slice(1, -1).trim();

      if (tablePath.length === 0) {
        throw tomlParseError(
          "TOML table name cannot be empty",
          lineNumber,
          sourceFormat,
          targetFormat
        );
      }

      currentTable = getOrCreateTable(root, tablePath, lineNumber, sourceFormat, targetFormat);
      return;
    }

    const separatorIndex = findKeyValueSeparator(line);

    if (separatorIndex === -1) {
      throw tomlParseError(
        "TOML line must contain a key-value separator",
        lineNumber,
        sourceFormat,
        targetFormat
      );
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (key.length === 0) {
      throw tomlParseError("TOML key cannot be empty", lineNumber, sourceFormat, targetFormat);
    }

    if (rawValue.length === 0) {
      throw tomlParseError("TOML value cannot be empty", lineNumber, sourceFormat, targetFormat);
    }

    setValue(
      currentTable,
      key,
      parseTomlValue(rawValue, lineNumber, sourceFormat, targetFormat),
      lineNumber,
      sourceFormat,
      targetFormat
    );
  });

  return root;
}

function stripComment(line: string): string {
  let inString = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (char === "#" && !inString) {
      return line.slice(0, index);
    }
  }

  return line;
}

function findKeyValueSeparator(line: string): number {
  let inString = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (char === "=" && !inString) {
      return index;
    }
  }

  return -1;
}

function getOrCreateTable(
  root: Record<string, unknown>,
  path: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): Record<string, unknown> {
  return path.split(".").reduce<Record<string, unknown>>((table, segment) => {
    const key = parseTomlKey(segment.trim(), lineNumber, sourceFormat, targetFormat);
    const value = table[key];

    if (value === undefined) {
      const child: Record<string, unknown> = {};
      table[key] = child;
      return child;
    }

    if (!isRecord(value)) {
      throw tomlParseError(
        "TOML table conflicts with an existing value",
        lineNumber,
        sourceFormat,
        targetFormat
      );
    }

    return value;
  }, root);
}

function setValue(
  table: Record<string, unknown>,
  keyPath: string,
  value: unknown,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): void {
  const keys = keyPath
    .split(".")
    .map((key) => parseTomlKey(key.trim(), lineNumber, sourceFormat, targetFormat));
  const valueKey = keys.at(-1);

  if (valueKey === undefined) {
    throw tomlParseError("TOML key cannot be empty", lineNumber, sourceFormat, targetFormat);
  }

  const target = keys.slice(0, -1).reduce<Record<string, unknown>>((parent, key) => {
    const child = parent[key];

    if (child === undefined) {
      const next: Record<string, unknown> = {};
      parent[key] = next;
      return next;
    }

    if (!isRecord(child)) {
      throw tomlParseError(
        "TOML dotted key conflicts with an existing value",
        lineNumber,
        sourceFormat,
        targetFormat
      );
    }

    return child;
  }, table);

  if (Object.hasOwn(target, valueKey)) {
    throw tomlParseError("TOML key is already defined", lineNumber, sourceFormat, targetFormat);
  }

  target[valueKey] = value;
}

function parseTomlKey(
  key: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): string {
  if (key.length === 0) {
    throw tomlParseError("TOML key cannot be empty", lineNumber, sourceFormat, targetFormat);
  }

  if (key.startsWith('"') && key.endsWith('"')) {
    return parseTomlString(key, lineNumber, sourceFormat, targetFormat);
  }

  if (/^[A-Za-z0-9_-]+$/.test(key)) {
    return key;
  }

  throw tomlParseError(
    "TOML key contains unsupported characters",
    lineNumber,
    sourceFormat,
    targetFormat
  );
}

function parseTomlValue(
  value: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): unknown {
  if (value.startsWith('"')) {
    return parseTomlString(value, lineNumber, sourceFormat, targetFormat);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return splitArrayItems(value.slice(1, -1), lineNumber, sourceFormat, targetFormat).map((item) =>
      parseTomlValue(item, lineNumber, sourceFormat, targetFormat)
    );
  }

  if (/^[+-]?(?:\d+|\d+\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
    return Number(value);
  }

  throw tomlParseError("TOML value is not supported", lineNumber, sourceFormat, targetFormat);
}

function parseTomlString(
  value: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): string {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === "string") {
      return parsed;
    }
  } catch {
    // Throw the normalized conversion error below.
  }

  throw tomlParseError("TOML string is invalid", lineNumber, sourceFormat, targetFormat);
}

function splitArrayItems(
  value: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): string[] {
  if (value.trim().length === 0) {
    return [];
  }

  const items: string[] = [];
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (char === "," && !inString) {
      items.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  if (inString) {
    throw tomlParseError(
      "TOML array contains an unterminated string",
      lineNumber,
      sourceFormat,
      targetFormat
    );
  }

  items.push(value.slice(start).trim());

  if (items.some((item) => item.length === 0)) {
    throw tomlParseError(
      "TOML array contains an empty item",
      lineNumber,
      sourceFormat,
      targetFormat
    );
  }

  return items;
}

function tomlParseError(
  message: string,
  lineNumber: number,
  sourceFormat: string,
  targetFormat: string
): ConversionError {
  return new ConversionError(message, {
    sourceFormat,
    targetFormat,
    context: { line: lineNumber },
  });
}
