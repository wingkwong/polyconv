import {
  BaseConverter,
  ConversionError,
  isPlainObject,
  parseJSON,
  validateNotEmpty,
} from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";

export interface JsonToTomlOptions extends ConversionOptions {
  /**
   * Whether to sort object keys
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to TOML format
 */
export class JsonToTomlConverter extends BaseConverter<string, string, JsonToTomlOptions> {
  readonly sourceFormat = "json";
  readonly targetFormat = "toml";

  convert(input: string, options: JsonToTomlOptions = {}): ConversionResult<string> {
    validateNotEmpty(input, this.sourceFormat);

    try {
      const jsonData = parseJSON(input);

      if (!isPlainObject(jsonData)) {
        throw new ConversionError("JSON to TOML requires a top-level object", {
          sourceFormat: this.sourceFormat,
          targetFormat: this.targetFormat,
          context: { actualType: Array.isArray(jsonData) ? "array" : typeof jsonData },
        });
      }

      const data = (options.sortKeys ? sortObjectKeys(jsonData) : jsonData) as Record<
        string,
        unknown
      >;
      const toml = stringifyToml(data, this.sourceFormat, this.targetFormat);

      return this.createResult(toml, {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to TOML", {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  validate(input: string): boolean {
    try {
      validateNotEmpty(input, this.sourceFormat);
      const jsonData = parseJSON(input);
      return isPlainObject(jsonData);
    } catch {
      return false;
    }
  }
}

/**
 * Convert JSON string to TOML
 */
export function jsonToToml(input: string, options?: JsonToTomlOptions): string {
  const converter = new JsonToTomlConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = sortObjectKeys(value[key]);
      return sorted;
    }, {});
}

function stringifyToml(
  data: Record<string, unknown>,
  sourceFormat: string,
  targetFormat: string
): string {
  const lines: string[] = [];

  writeTable(lines, [], data, sourceFormat, targetFormat);

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}

function writeTable(
  lines: string[],
  path: string[],
  table: Record<string, unknown>,
  sourceFormat: string,
  targetFormat: string
): void {
  const childTables: Array<[string, Record<string, unknown>]> = [];

  for (const [key, value] of Object.entries(table)) {
    if (isPlainObject(value)) {
      childTables.push([key, value]);
      continue;
    }

    lines.push(`${formatKey(key)} = ${formatTomlValue(value, sourceFormat, targetFormat)}`);
  }

  for (const [key, childTable] of childTables) {
    if (lines.length > 0) {
      lines.push("");
    }

    const childPath = [...path, key];
    lines.push(`[${childPath.map(formatKey).join(".")}]`);
    writeTable(lines, childPath, childTable, sourceFormat, targetFormat);
  }
}

function formatTomlValue(value: unknown, sourceFormat: string, targetFormat: string): string {
  if (typeof value === "string") {
    return formatString(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => formatTomlValue(item, sourceFormat, targetFormat)).join(", ")}]`;
  }

  if (isPlainObject(value)) {
    return `{ ${Object.entries(value)
      .map(
        ([key, item]) => `${formatKey(key)} = ${formatTomlValue(item, sourceFormat, targetFormat)}`
      )
      .join(", ")} }`;
  }

  throw new ConversionError("JSON value cannot be represented as TOML", {
    sourceFormat,
    targetFormat,
    context: { actualType: value === null ? "null" : typeof value },
  });
}

function formatKey(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : formatString(key);
}

function formatString(value: string): string {
  return JSON.stringify(value);
}
