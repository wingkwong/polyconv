import { ConversionError } from "./errors.js";

/**
 * Type guard to check if a value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a valid JSON value
 */
export function isValidJSON(value: unknown): boolean {
  if (value === null) return true;

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isValidJSON);
  }

  if (type === "object") {
    return Object.values(value as object).every(isValidJSON);
  }

  return false;
}

/**
 * Validate that a string is valid JSON
 */
export function validateJSONString(input: string): void {
  try {
    JSON.parse(input);
  } catch (error) {
    throw new ConversionError("Invalid JSON string", {
      sourceFormat: "json",
      context: { input: input.slice(0, 100) },
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Safely parse JSON string with better error messages
 */
export function parseJSON<T = unknown>(input: string): T {
  try {
    return JSON.parse(input) as T;
  } catch (error) {
    throw new ConversionError("Failed to parse JSON", {
      sourceFormat: "json",
      context: { preview: input.slice(0, 100) },
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Validate that input is not empty
 */
export function validateNotEmpty(input: string, format: string): void {
  if (!input || input.trim().length === 0) {
    throw new ConversionError("Input cannot be empty", {
      sourceFormat: format,
    });
  }
}
