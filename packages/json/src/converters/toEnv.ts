import { BaseConverter, ConversionError } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import {
  getJsonType,
  isNonNullScalar,
  parseTopLevelObject,
  sortObjectKeys,
} from "../utils/conversion.js";

export interface JsonToEnvOptions extends ConversionOptions {
  /**
   * Whether to sort environment variable names
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to ENV format
 */
export class JsonToEnvConverter extends BaseConverter<string, string, JsonToEnvOptions> {
  readonly sourceFormat = "json";
  readonly targetFormat = "env";

  convert(input: string, options: JsonToEnvOptions = {}): ConversionResult<string> {
    try {
      const parsed = parseTopLevelObject(input, {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
      });
      const data = (options.sortKeys ? sortObjectKeys(parsed) : parsed) as Record<string, unknown>;
      const lines: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          throw new ConversionError("ENV keys must match /^[A-Za-z_][A-Za-z0-9_]*$/", {
            sourceFormat: this.sourceFormat,
            targetFormat: this.targetFormat,
            context: { key },
          });
        }

        if (!isNonNullScalar(value)) {
          throw new ConversionError("ENV values must be strings, numbers, or booleans", {
            sourceFormat: this.sourceFormat,
            targetFormat: this.targetFormat,
            context: { key, actualType: getJsonType(value) },
          });
        }

        lines.push(`${key}=${formatEnvValue(value)}`);
      }

      return this.createResult(lines.length > 0 ? `${lines.join("\n")}\n` : "", {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to ENV", {
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
 * Convert JSON string to ENV
 */
export function jsonToEnv(input: string, options?: JsonToEnvOptions): string {
  const converter = new JsonToEnvConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function formatEnvValue(value: string | number | boolean): string {
  if (typeof value !== "string") {
    return String(value);
  }

  if (!/[ \t\r\n#"'=]/.test(value)) {
    return value;
  }

  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll('"', '\\"')}"`;
}
