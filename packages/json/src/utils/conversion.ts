import { ConversionError, isPlainObject, parseJSON, validateNotEmpty } from "@polyconv/core";

export type JsonScalar = string | number | boolean | null;
export type NonNullJsonScalar = string | number | boolean;
export type TableRow = Record<string, JsonScalar>;

export interface JsonOutputOptions {
  sourceFormat: string;
  targetFormat: string;
}

export function parseJsonInput(input: string, formats: JsonOutputOptions): unknown {
  validateNotEmpty(input, formats.sourceFormat);
  return parseJSON(input);
}

export function parseTopLevelObject(
  input: string,
  formats: JsonOutputOptions
): Record<string, unknown> {
  const data = parseJsonInput(input, formats);

  if (!isPlainObject(data)) {
    throw new ConversionError(
      `JSON to ${formats.targetFormat.toUpperCase()} requires a top-level object`,
      {
        sourceFormat: formats.sourceFormat,
        targetFormat: formats.targetFormat,
        context: { actualType: getJsonType(data) },
      }
    );
  }

  return data;
}

export function sortObjectKeys(value: unknown): unknown {
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

export function isScalar(value: unknown): value is JsonScalar {
  return value === null || isNonNullScalar(value);
}

export function isNonNullScalar(value: unknown): value is NonNullJsonScalar {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function getTableData(input: string, formats: JsonOutputOptions, sortKeys = false) {
  const data = parseJsonInput(input, formats);
  const rawRows = Array.isArray(data) ? data : [data];

  if (!rawRows.every(isPlainObject)) {
    throw new ConversionError(
      `JSON to ${formats.targetFormat.toUpperCase()} requires an object or array of objects`,
      {
        sourceFormat: formats.sourceFormat,
        targetFormat: formats.targetFormat,
        context: { actualType: getJsonType(data) },
      }
    );
  }

  const rows = rawRows.map((row, rowIndex) => {
    const scalarRow: TableRow = {};

    for (const [key, value] of Object.entries(row)) {
      if (!isScalar(value)) {
        throw new ConversionError("Table cell values must be strings, numbers, booleans, or null", {
          sourceFormat: formats.sourceFormat,
          targetFormat: formats.targetFormat,
          context: { key, row: rowIndex, actualType: getJsonType(value) },
        });
      }

      scalarRow[key] = value;
    }

    return scalarRow;
  });

  const headerSet = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headerSet.add(key);
    }
  }

  const headers = [...headerSet];
  if (sortKeys) {
    headers.sort();
  }

  return { headers, rows };
}

export function stringifyScalar(value: JsonScalar): string {
  return value === null ? "" : String(value);
}

export function escapeDelimitedCell(value: string, delimiter: "," | "\t"): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuotes) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function escapeMarkdownCell(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getJsonType(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}
