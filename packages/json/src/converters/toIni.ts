import { BaseConverter, ConversionError, isPlainObject } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import {
  getJsonType,
  isNonNullScalar,
  parseTopLevelObject,
  sortObjectKeys,
} from "../utils/conversion.js";

export interface JsonToIniOptions extends ConversionOptions {
  /**
   * Whether to sort object keys
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to INI format
 */
export class JsonToIniConverter extends BaseConverter<string, string, JsonToIniOptions> {
  readonly sourceFormat = "json";
  readonly targetFormat = "ini";

  convert(input: string, options: JsonToIniOptions = {}): ConversionResult<string> {
    try {
      const parsed = parseTopLevelObject(input, {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
      });
      const data = (options.sortKeys ? sortObjectKeys(parsed) : parsed) as Record<string, unknown>;
      const ini = stringifyIni(data, this.sourceFormat, this.targetFormat);

      return this.createResult(ini, {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to INI", {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  validate(input: string): boolean {
    try {
      this.convert(input);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convert JSON string to INI
 */
export function jsonToIni(input: string, options?: JsonToIniOptions): string {
  const converter = new JsonToIniConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function stringifyIni(
  data: Record<string, unknown>,
  sourceFormat: string,
  targetFormat: string
): string {
  const rootLines: string[] = [];
  const sections: string[] = [];

  writeIniObject(rootLines, sections, [], data, sourceFormat, targetFormat);

  const lines = [...rootLines];
  if (rootLines.length > 0 && sections.length > 0) {
    lines.push("");
  }
  lines.push(...sections);

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}

function writeIniObject(
  rootLines: string[],
  sections: string[],
  path: string[],
  data: Record<string, unknown>,
  sourceFormat: string,
  targetFormat: string
): void {
  const childSections: Array<[string, Record<string, unknown>]> = [];
  const scalarLines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (isPlainObject(value)) {
      childSections.push([key, value]);
      continue;
    }

    if (!isNonNullScalar(value)) {
      throw new ConversionError("INI values must be strings, numbers, or booleans", {
        sourceFormat,
        targetFormat,
        context: { key: [...path, key].join("."), actualType: getJsonType(value) },
      });
    }

    scalarLines.push(`${key}=${formatIniValue(value)}`);
  }

  if (path.length === 0) {
    rootLines.push(...scalarLines);
  } else {
    if (sections.length > 0) {
      sections.push("");
    }

    sections.push(`[${path.join(".")}]`);
    sections.push(...scalarLines);
  }

  for (const [key, child] of childSections) {
    writeIniObject(rootLines, sections, [...path, key], child, sourceFormat, targetFormat);
  }
}

function formatIniValue(value: string | number | boolean): string {
  return String(value);
}
