import { Command } from "commander";
import { convertAction } from "../actions/convertAction.js";

export function createConvertCommand(): Command {
  return new Command("convert")
    .description("Convert files between formats")
    .argument("<input>", "Input file path or '-' for stdin")
    .option("-t, --to <format>", "Target format (xml, yaml, toml)")
    .option("-o, --output <file>", "Output file path (defaults to stdout)")
    .option("-p, --pretty", "Pretty print output", false)
    .option("-i, --indent <number>", "Indentation size", "2")
    .option("--root-name <name>", "Root element name for XML output", "root")
    .option("--sort-keys", "Sort object keys", false)
    .action(convertAction);
}
