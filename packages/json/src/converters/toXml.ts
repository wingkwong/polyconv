import { BaseConverter, ConversionError, parseJSON, validateNotEmpty } from "@polyconv/core";
import type { ConversionOptions, ConversionResult } from "@polyconv/core";
import XMLBuilder from "fast-xml-builder";
import type { XmlBuilderOptions } from "fast-xml-builder";

export interface JsonToXmlOptions extends ConversionOptions {
  /**
   * Name of the root XML element
   * @default "root"
   */
  rootName?: string;

  /**
   * Whether to ignore attributes
   * @default false
   */
  ignoreAttributes?: boolean;

  /**
   * Attribute name prefix
   * @default "@_"
   */
  attributeNamePrefix?: string;

  /**
   * Whether to use CDATA for text values
   * @default false
   */
  cdataTagName?: string;

  /**
   * Text node name
   * @default "#text"
   */
  textNodeName?: string;
}

/**
 * Converter for JSON to XML format
 */
export class JsonToXmlConverter extends BaseConverter<string, string, JsonToXmlOptions> {
  readonly sourceFormat = "json";
  readonly targetFormat = "xml";

  convert(input: string, options: JsonToXmlOptions = {}): ConversionResult<string> {
    validateNotEmpty(input, this.sourceFormat);

    try {
      const jsonData = parseJSON(input);

      const builderOptions: Partial<XmlBuilderOptions> = {
        ignoreAttributes: options.ignoreAttributes ?? false,
        attributeNamePrefix: options.attributeNamePrefix ?? "@_",
        textNodeName: options.textNodeName ?? "#text",
        format: options.pretty,
        indentBy: options.indent ? " ".repeat(options.indent) : "  ",
        suppressEmptyNode: true,
      };

      if (options.cdataTagName) {
        builderOptions.cdataPropName = options.cdataTagName;
      }

      const builder = new XMLBuilder(builderOptions);

      // Wrap the JSON data in a root element if it's not already an object with a single key
      let dataToConvert = jsonData;
      const rootName = options.rootName ?? "root";

      if (
        Array.isArray(jsonData) ||
        (typeof jsonData === "object" && Object.keys(jsonData as object).length !== 1)
      ) {
        dataToConvert = { [rootName]: jsonData };
      }

      const xml = builder.build(dataToConvert);

      return this.createResult(xml, {
        rootName,
        options: builderOptions,
      });
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError("Failed to convert JSON to XML", {
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
 * Convert JSON string to XML
 */
export function jsonToXml(input: string, options?: JsonToXmlOptions): string {
  const converter = new JsonToXmlConverter();
  const result = converter.convert(input, options);
  return result.data;
}
