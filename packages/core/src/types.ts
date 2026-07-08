/**
 * Base conversion options that all converters can extend
 */
export interface ConversionOptions {
  /**
   * Whether to format/prettify the output
   * @default false
   */
  pretty?: boolean;

  /**
   * Indentation size for formatted output
   * @default 2
   */
  indent?: number;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult<T = string> {
  /**
   * The converted output
   */
  data: T;

  /**
   * Format of the output
   */
  format: string;

  /**
   * Optional metadata about the conversion
   */
  metadata?: Record<string, unknown>;
}

/**
 * Base converter interface that all converters should implement
 */
export interface Converter<
  TInput = unknown,
  TOutput = string,
  TOptions extends ConversionOptions = ConversionOptions,
> {
  /**
   * The source format this converter accepts
   */
  readonly sourceFormat: string;

  /**
   * The target format this converter produces
   */
  readonly targetFormat: string;

  /**
   * Convert input to the target format
   */
  convert(input: TInput, options?: TOptions): ConversionResult<TOutput>;

  /**
   * Validate input before conversion
   */
  validate(input: TInput): boolean;
}

/**
 * Base converter class with common functionality
 */
export abstract class BaseConverter<
  TInput = unknown,
  TOutput = string,
  TOptions extends ConversionOptions = ConversionOptions,
> implements Converter<TInput, TOutput, TOptions> {
  abstract readonly sourceFormat: string;
  abstract readonly targetFormat: string;

  abstract convert(input: TInput, options?: TOptions): ConversionResult<TOutput>;

  abstract validate(input: TInput): boolean;

  /**
   * Helper to create a conversion result
   */
  protected createResult(
    data: TOutput,
    metadata?: Record<string, unknown>
  ): ConversionResult<TOutput> {
    return {
      data,
      format: this.targetFormat,
      metadata,
    };
  }
}
