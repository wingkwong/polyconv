/**
 * Custom error class for conversion operations
 */
export class ConversionError extends Error {
  /**
   * The format being converted from
   */
  public readonly sourceFormat?: string;

  /**
   * The format being converted to
   */
  public readonly targetFormat?: string;

  /**
   * Additional context about the error
   */
  public readonly context?: Record<string, unknown>;

  /**
   * The original error that caused this conversion error
   */
  public readonly cause?: Error;

  constructor(
    message: string,
    options?: {
      sourceFormat?: string;
      targetFormat?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = "ConversionError";
    this.sourceFormat = options?.sourceFormat;
    this.targetFormat = options?.targetFormat;
    this.context = options?.context;
    this.cause = options?.cause;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
      }
    ).captureStackTrace;
    if (captureStackTrace) {
      captureStackTrace(this, ConversionError);
    }
  }

  /**
   * Get a formatted error message with context
   */
  toString(): string {
    const parts = [this.message];

    if (this.sourceFormat && this.targetFormat) {
      parts.push(`(${this.sourceFormat} → ${this.targetFormat})`);
    }

    if (this.context) {
      parts.push(`Context: ${JSON.stringify(this.context)}`);
    }

    if (this.cause) {
      parts.push(`Caused by: ${this.cause.message}`);
    }

    return parts.join(" ");
  }
}
