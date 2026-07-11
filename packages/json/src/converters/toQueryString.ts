import { BaseConverter, ConversionError, isPlainObject } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import { getJsonType, isScalar, parseTopLevelObject, sortObjectKeys } from "../utils/conversion.js";

export interface JsonToQueryStringOptions extends ConversionOptions {
  /**
   * Whether to sort query parameter names
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to URL query string format
 */
export class JsonToQueryStringConverter extends BaseConverter<
  string,
  string,
  JsonToQueryStringOptions
> {
  readonly sourceFormat = "json";
  readonly targetFormat = "query";

  convert(input: string, options: JsonToQueryStringOptions = {}): ConversionResult<string> {
    try {
      const parsed = parseTopLevelObject(input, {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
      });
      const data = (options.sortKeys ? sortObjectKeys(parsed) : parsed) as Record<string, unknown>;
      const pairs: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        appendQueryValue(pairs, key, value, this.sourceFormat, this.targetFormat);
      }

      return this.createResult(pairs.join("&"), {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to query string", {
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
 * Convert JSON string to URL query string
 */
export function jsonToQueryString(input: string, options?: JsonToQueryStringOptions): string {
  const converter = new JsonToQueryStringConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function appendQueryValue(
  pairs: string[],
  key: string,
  value: unknown,
  sourceFormat: string,
  targetFormat: string
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isScalar(item)) {
        throw new ConversionError(
          "Query string array values must be strings, numbers, booleans, or null",
          {
            sourceFormat,
            targetFormat,
            context: { key, actualType: getJsonType(item) },
          }
        );
      }

      pairs.push(formatQueryPair(key, item));
    }

    return;
  }

  if (isPlainObject(value)) {
    throw new ConversionError("Nested objects cannot be represented as query string values", {
      sourceFormat,
      targetFormat,
      context: { key },
    });
  }

  if (!isScalar(value)) {
    throw new ConversionError(
      "Query string values must be strings, numbers, booleans, null, or arrays of those values",
      {
        sourceFormat,
        targetFormat,
        context: { key, actualType: getJsonType(value) },
      }
    );
  }

  pairs.push(formatQueryPair(key, value));
}

function formatQueryPair(key: string, value: string | number | boolean | null): string {
  return `${encodeQueryComponent(key)}=${encodeQueryComponent(stringifyQueryValue(value))}`;
}

function stringifyQueryValue(value: string | number | boolean | null): string {
  return value === null ? "" : String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value)
    .replaceAll("!", "%21")
    .replaceAll("'", "%27")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29")
    .replaceAll("~", "%7E")
    .replaceAll("%20", "+");
}
