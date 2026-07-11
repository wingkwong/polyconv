import { Command } from "commander";
import { convertAction } from "../actions/convertAction.js";

interface MinifyOptions {
  output?: string;
}

export function createMinifyCommand(): Command {
  return new Command("minify")
    .description("Minify JSON files")
    .argument("<input>", "Input file path or '-' for stdin")
    .option("-o, --output <file>", "Output file path (defaults to stdout)")
    .action(async (input: string, options: MinifyOptions) => {
      await convertAction(input, {
        ...options,
        allowJsonUtilityTarget: true,
        from: "json",
        to: "minify",
      });
    });
}
