import { readInput, writeOutput } from "../utils/io.js";
import {
  formatJson,
  jsonToCsv,
  jsonToEnv,
  jsonToHtmlTable,
  jsonToIni,
  jsonToMarkdownTable,
  jsonToQueryString,
  jsonToToml,
  jsonToTsv,
  jsonToXml,
  jsonToYaml,
  minifyJson,
} from "@polyconv/json";
import { tomlToJson } from "@polyconv/toml";
import { ConversionError } from "@polyconv/core";

interface ConvertOptions {
  from?: string;
  to?: string;
  output?: string;
  pretty?: boolean;
  indent?: string;
  rootName?: string;
  sortKeys?: boolean;
  allowJsonUtilityTarget?: boolean;
}

type SourceFormat = "json" | "toml";

export async function convertAction(input: string, options: ConvertOptions): Promise<void> {
  try {
    if (!options.to) {
      throw new Error("Target format is required. Use --to <format>");
    }

    const sourceFormat = resolveSourceFormat(input, options.from);
    const targetFormat = normalizeTargetFormat(options.to);
    const supportedFormats = getSupportedTargetFormats(options.allowJsonUtilityTarget ?? false);

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
    const output = convertData(inputData, sourceFormat, targetFormat, {
      indent,
      pretty,
      rootName: options.rootName,
      sortKeys: options.sortKeys,
    });

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

function getSupportedTargetFormats(includeJsonUtilityTargets: boolean): string[] {
  const targetFormats = [
    "json",
    "xml",
    "yaml",
    "yml",
    "toml",
    "csv",
    "tsv",
    "ini",
    "env",
    "markdown",
    "html",
    "query",
  ];

  if (includeJsonUtilityTargets) {
    targetFormats.push("format", "minify");
  }

  return targetFormats;
}

function resolveSourceFormat(input: string, requestedFormat?: string): SourceFormat {
  if (requestedFormat) {
    const sourceFormat = requestedFormat.toLowerCase();

    if (sourceFormat === "json" || sourceFormat === "toml") {
      return sourceFormat;
    }

    throw new Error(`Unsupported source format: ${sourceFormat}. Supported formats: json, toml`);
  }

  if (input === "-") {
    throw new Error("Source format is required for stdin. Use --from <format>");
  }

  const extension = input.split(/[\\/]/).at(-1)?.split(".").at(-1)?.toLowerCase();

  if (extension === "json") {
    return "json";
  }

  if (extension === "toml") {
    return "toml";
  }

  throw new Error("Could not infer source format from input path. Use --from <format>");
}

function normalizeTargetFormat(targetFormat: string): string {
  const normalized = targetFormat.toLowerCase();
  return normalized === "yml" ? "yaml" : normalized;
}

function convertData(
  inputData: string,
  sourceFormat: SourceFormat,
  targetFormat: string,
  options: {
    indent: number;
    pretty: boolean;
    rootName?: string;
    sortKeys?: boolean;
  }
): string {
  if (sourceFormat === "toml" && targetFormat === "toml") {
    return inputData;
  }

  const jsonInput =
    sourceFormat === "json"
      ? inputData
      : tomlToJson(inputData, {
          indent: options.indent,
          pretty: false,
        });

  switch (targetFormat) {
    case "json":
    case "format":
      return sourceFormat === "toml"
        ? tomlToJson(inputData, {
            indent: options.indent,
            pretty: true,
            sortKeys: options.sortKeys,
          })
        : formatJson(jsonInput, {
            indent: options.indent,
            sortKeys: options.sortKeys,
          });

    case "minify":
      return sourceFormat === "toml" ? tomlToJson(inputData) : minifyJson(jsonInput);

    case "xml":
      return jsonToXml(jsonInput, {
        rootName: options.rootName,
        pretty: options.pretty,
        indent: options.indent,
      });

    case "yaml":
      return jsonToYaml(jsonInput, {
        pretty: options.pretty,
        indent: options.indent,
        sortKeys: options.sortKeys,
      });

    case "toml":
      return jsonToToml(jsonInput, {
        indent: options.indent,
        sortKeys: options.sortKeys,
      });

    case "csv":
      return jsonToCsv(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "tsv":
      return jsonToTsv(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "ini":
      return jsonToIni(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "env":
      return jsonToEnv(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "markdown":
      return jsonToMarkdownTable(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "html":
      return jsonToHtmlTable(jsonInput, {
        sortKeys: options.sortKeys,
      });

    case "query":
      return jsonToQueryString(jsonInput, {
        sortKeys: options.sortKeys,
      });

    default:
      throw new Error(`Unhandled format: ${targetFormat}`);
  }
}
