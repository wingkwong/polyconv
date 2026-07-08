import { Command } from "commander";
import { createConvertCommand } from "./commands/convert.js";
import { createFormatCommand } from "./commands/format.js";
import { createMinifyCommand } from "./commands/minify.js";

const program = new Command();

program
  .name("polyconv")
  .description("A modular toolkit for converting between data formats")
  .version("0.1.0");

// Add commands
program.addCommand(createConvertCommand());
program.addCommand(createFormatCommand());
program.addCommand(createMinifyCommand());

// Parse arguments
program.parse();
