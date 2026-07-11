import { BaseConverter, ConversionError } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import { escapeMarkdownCell, getTableData, stringifyScalar } from "../utils/conversion.js";

export interface JsonToMarkdownTableOptions extends ConversionOptions {
  /**
   * Whether to sort table headers
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to Markdown table format
 */
export class JsonToMarkdownTableConverter extends BaseConverter<
  string,
  string,
  JsonToMarkdownTableOptions
> {
  readonly sourceFormat = "json";
  readonly targetFormat = "markdown";

  convert(input: string, options: JsonToMarkdownTableOptions = {}): ConversionResult<string> {
    try {
      const { headers, rows } = getTableData(
        input,
        {
          sourceFormat: this.sourceFormat,
          targetFormat: this.targetFormat,
        },
        options.sortKeys ?? false
      );

      const headerLine = formatMarkdownRow(headers);
      const separatorLine = formatMarkdownRow(headers.map(() => "---"));
      const bodyLines = rows.map((row) =>
        formatMarkdownRow(headers.map((header) => stringifyScalar(row[header] ?? null)))
      );

      return this.createResult(`${[headerLine, separatorLine, ...bodyLines].join("\n")}\n`, {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to Markdown table", {
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
 * Convert JSON string to Markdown table
 */
export function jsonToMarkdownTable(input: string, options?: JsonToMarkdownTableOptions): string {
  const converter = new JsonToMarkdownTableConverter();
  const result = converter.convert(input, options);
  return result.data;
}

function formatMarkdownRow(cells: string[]): string {
  return `| ${cells.map(escapeMarkdownCell).join(" | ")} |`;
}
