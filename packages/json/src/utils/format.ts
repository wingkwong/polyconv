import { parseJSON } from "@polyconv/core";

export interface FormatOptions {
  /**
   * Number of spaces for indentation
   * @default 2
   */
  indent?: number;

  /**
   * Whether to sort object keys
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * Format JSON string with specified indentation
 */
export function formatJson(input: string, options: FormatOptions = {}): string {
  const data = parseJSON(input);
  const indent = options.indent ?? 2;

  if (options.sortKeys) {
    return JSON.stringify(sortObjectKeys(data), null, indent);
  }

  return JSON.stringify(data, null, indent);
}

/**
 * Minify JSON string (remove all whitespace)
 */
export function minifyJson(input: string): string {
  const data = parseJSON(input);
  return JSON.stringify(data);
}

/**
 * Recursively sort object keys
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }

    return sorted;
  }

  return obj;
}
