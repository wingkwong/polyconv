import { BaseConverter, ConversionError } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import { escapeDelimitedCell, getTableData, stringifyScalar } from "../utils/conversion.js";

export interface JsonToDelimitedOptions extends ConversionOptions {
  /**
   * Whether to sort table headers
   * @default false
   */
  sortKeys?: boolean;
}

abstract class JsonToDelimitedConverter extends BaseConverter<
  string,
  string,
  JsonToDelimitedOptions
> {
  readonly sourceFormat = "json";
  abstract readonly targetFormat: "csv" | "tsv";
  protected abstract readonly delimiter: "," | "\t";

  convert(input: string, options: JsonToDelimitedOptions = {}): ConversionResult<string> {
    try {
      const { headers, rows } = getTableData(
        input,
        {
          sourceFormat: this.sourceFormat,
          targetFormat: this.targetFormat,
        },
        options.sortKeys ?? false
      );

      const lines = [
        headers.map((header) => escapeDelimitedCell(header, this.delimiter)).join(this.delimiter),
        ...rows.map((row) =>
          headers
            .map((header) =>
              escapeDelimitedCell(stringifyScalar(row[header] ?? null), this.delimiter)
            )
            .join(this.delimiter)
        ),
      ];

      return this.createResult(`${lines.join("\n")}\n`, {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError(`Failed to convert JSON to ${this.targetFormat.toUpperCase()}`, {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  validate(input: string): boolean {
    try {
      getTableData(input, {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Converter for JSON to CSV format
 */
export class JsonToCsvConverter extends JsonToDelimitedConverter {
  readonly targetFormat = "csv";
  protected readonly delimiter = ",";
}

/**
 * Converter for JSON to TSV format
 */
export class JsonToTsvConverter extends JsonToDelimitedConverter {
  readonly targetFormat = "tsv";
  protected readonly delimiter = "\t";
}

/**
 * Convert JSON string to CSV
 */
export function jsonToCsv(input: string, options?: JsonToDelimitedOptions): string {
  const converter = new JsonToCsvConverter();
  const result = converter.convert(input, options);
  return result.data;
}

/**
 * Convert JSON string to TSV
 */
export function jsonToTsv(input: string, options?: JsonToDelimitedOptions): string {
  const converter = new JsonToTsvConverter();
  const result = converter.convert(input, options);
  return result.data;
}
