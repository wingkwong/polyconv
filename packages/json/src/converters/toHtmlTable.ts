import { BaseConverter, ConversionError } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import { escapeHtml, getTableData, stringifyScalar } from "../utils/conversion.js";

export interface JsonToHtmlTableOptions extends ConversionOptions {
  /**
   * Whether to sort table headers
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Converter for JSON to HTML table markup
 */
export class JsonToHtmlTableConverter extends BaseConverter<
  string,
  string,
  JsonToHtmlTableOptions
> {
  readonly sourceFormat = "json";
  readonly targetFormat = "html";

  convert(input: string, options: JsonToHtmlTableOptions = {}): ConversionResult<string> {
    try {
      const { headers, rows } = getTableData(
        input,
        {
          sourceFormat: this.sourceFormat,
          targetFormat: this.targetFormat,
        },
        options.sortKeys ?? false
      );

      const headerRow = `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>`;
      const bodyRows = rows.map(
        (row) =>
          `<tr>${headers
            .map((header) => `<td>${escapeHtml(stringifyScalar(row[header] ?? null))}</td>`)
            .join("")}</tr>`
      );
      const html = `<table>\n<thead>\n${headerRow}\n</thead>\n<tbody>\n${bodyRows.join("\n")}\n</tbody>\n</table>\n`;

      return this.createResult(html, {
        options: {
          sortKeys: options.sortKeys ?? false,
        },
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to HTML table", {
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
 * Convert JSON string to HTML table markup
 */
export function jsonToHtmlTable(input: string, options?: JsonToHtmlTableOptions): string {
  const converter = new JsonToHtmlTableConverter();
  const result = converter.convert(input, options);
  return result.data;
}
