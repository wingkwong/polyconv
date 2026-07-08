import { readFile, writeFile } from "fs/promises";
import { stdin, stdout } from "process";

/**
 * Read input from file or stdin
 */
export async function readInput(input: string): Promise<string> {
  if (input === "-") {
    // Read from stdin
    return readStdin();
  }

  try {
    return await readFile(input, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file: ${input}`, {
      cause: error,
    });
  }
}

/**
 * Write output to file or stdout
 */
export async function writeOutput(data: string, output?: string): Promise<void> {
  if (!output) {
    // Write to stdout
    stdout.write(data);
    stdout.write("\n");
    return;
  }

  try {
    await writeFile(output, data, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write file: ${output}`, {
      cause: error,
    });
  }
}

/**
 * Read from stdin
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stdin.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    stdin.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });

    stdin.on("error", (error) => {
      reject(new Error("Failed to read from stdin", { cause: error }));
    });
  });
}
