import { BaseConverter, ConversionError, parseJSON, validateNotEmpty } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import * as yaml from "js-yaml";

export interface JsonToYamlOptions extends ConversionOptions {
  /**
   * Max line width for YAML output
   * @default 80
   */
  lineWidth?: number;

  /**
   * Whether to use flow style (inline) for collections
   * @default false
   */
  flowLevel?: number;

  /**
   * Whether to sort object keys
   * @default false
   */
  sortKeys?: boolean;

  /**
   * Whether to skip invalid values
   * @default false
   */
  skipInvalid?: boolean;
}

/**
 * Converter for JSON to YAML format
 */
export class JsonToYamlConverter extends BaseConverter<string, string, JsonToYamlOptions> {
  readonly sourceFormat = "json";
  readonly targetFormat = "yaml";

  convert(input: string, options: JsonToYamlOptions = {}): ConversionResult<string> {
    validateNotEmpty(input, this.sourceFormat);

    try {
      const jsonData = parseJSON(input);

      const yamlOptions: yaml.DumpOptions = {
        indent: options.indent ?? 2,
        lineWidth: options.lineWidth ?? 80,
        noRefs: true,
        sortKeys: options.sortKeys ?? false,
        skipInvalid: options.skipInvalid ?? false,
      };

      if (options.flowLevel !== undefined) {
        yamlOptions.flowLevel = options.flowLevel;
      }

      const yamlStr = yaml.dump(jsonData, yamlOptions);

      return this.createResult(yamlStr, {
        options: yamlOptions,
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to YAML", {
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  validate(input: string): boolean {
    try {
      validateNotEmpty(input, this.sourceFormat);
      parseJSON(input);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convert JSON string to YAML
 */
export function jsonToYaml(input: string, options?: JsonToYamlOptions): string {
  const converter = new JsonToYamlConverter();
  const result = converter.convert(input, options);
  return result.data;
}
