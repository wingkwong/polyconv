import { readInput, writeOutput } from "../utils/io.js";
import { jsonToXml, jsonToYaml, jsonToToml, formatJson, minifyJson } from "@polyconv/json";
import { ConversionError } from "@polyconv/core";

interface ConvertOptions {
  to?: string;
  output?: string;
  pretty?: boolean;
  indent?: string;
  rootName?: string;
  sortKeys?: boolean;
}

export async function convertAction(input: string, options: ConvertOptions): Promise<void> {
  try {
    // Validate target format
    if (!options.to) {
      throw new Error("Target format is required. Use --to <format>");
    }

    const targetFormat = options.to.toLowerCase();
    const supportedFormats = ["xml", "yaml", "yml", "toml", "format", "minify"];

    if (!supportedFormats.includes(targetFormat)) {
      throw new Error(
        `Unsupported target format: ${targetFormat}. Supported formats: ${supportedFormats.join(", ")}`
      );
    }

    // Read input
    const inputData = await readInput(input);

    // Parse options
    const indent = parseInt(options.indent ?? "2", 10);
    const pretty = options.pretty ?? false;

    // Convert based on target format
    let output: string;

    switch (targetFormat) {
      case "xml":
        output = jsonToXml(inputData, {
          rootName: options.rootName,
          pretty,
          indent,
        });
        break;

      case "yaml":
      case "yml":
        output = jsonToYaml(inputData, {
          pretty,
          indent,
          sortKeys: options.sortKeys,
        });
        break;

      case "toml":
        output = jsonToToml(inputData, {
          indent,
          sortKeys: options.sortKeys,
        });
        break;

      case "format":
        output = formatJson(inputData, {
          indent,
          sortKeys: options.sortKeys,
        });
        break;

      case "minify":
        output = minifyJson(inputData);
        break;

      default:
        throw new Error(`Unhandled format: ${targetFormat}`);
    }

    // Write output
    await writeOutput(output, options.output);

    // Success message (only if writing to file, not stdout)
    if (options.output) {
      console.error(`✓ Successfully converted to ${targetFormat}: ${options.output}`);
    }
  } catch (error) {
    if (error instanceof ConversionError) {
      console.error(`✗ Conversion Error: ${error.toString()}`);
      process.exit(1);
    }

    if (error instanceof Error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }

    console.error(`✗ Unknown error occurred`);
    process.exit(1);
  }
}
