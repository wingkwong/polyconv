import { Command } from "commander";
import { convertAction } from "../actions/convertAction.js";

interface FormatOptions {
  output?: string;
  indent?: string;
  sortKeys?: boolean;
}

export function createFormatCommand(): Command {
  return new Command("format")
    .description("Format JSON files")
    .argument("<input>", "Input file path or '-' for stdin")
    .option("-o, --output <file>", "Output file path (defaults to stdout)")
    .option("-i, --indent <number>", "Indentation size", "2")
    .option("--sort-keys", "Sort object keys", false)
    .action(async (input: string, options: FormatOptions) => {
      await convertAction(input, {
        ...options,
        allowJsonUtilityTarget: true,
        from: "json",
        to: "format",
      });
    });
}
