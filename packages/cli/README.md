# @polyconv/cli

Command-line interface for Polyconv. The current CLI focuses on JSON input: convert JSON to XML or YAML, format JSON, and minify JSON.

## Installation

```bash
# Install globally
pnpm add -g @polyconv/cli

# Or use with pnpx
pnpx @polyconv/cli convert --help
```

This package requires Node.js 22+.

## Usage

### Basic Conversion

```bash
# Convert JSON to XML
polyconv convert input.json --to xml --output output.xml

# Convert JSON to YAML
polyconv convert input.json --to yaml --output output.yaml

# Format JSON
polyconv format input.json --indent 2 --sort-keys --output formatted.json

# Minify JSON
polyconv minify input.json --output minified.json
```

### Options

```bash
# Pretty print output
polyconv convert input.json --to yaml --pretty

# Custom indentation
polyconv convert input.json --to yaml --indent 4

# Sort object keys
polyconv convert input.json --to yaml --sort-keys

# Custom XML root element name
polyconv convert input.json --to xml --root-name data
```

### Stdin/Stdout

```bash
# Read from stdin, write to stdout
cat input.json | polyconv convert - --to yaml

# Pipe through multiple commands
curl https://api.example.com/data.json | polyconv convert - --to yaml | less

# Read from stdin, write to file
cat input.json | polyconv convert - --to xml --output output.xml

# Format stdin
cat input.json | polyconv format - --sort-keys
```

## Commands

### convert

Convert files between formats.

```bash
polyconv convert <input> [options]
```

#### Arguments

- `<input>` - Input file path or `-` for stdin

#### Options

- `-t, --to <format>` - Target format (required)
  - `xml` - Convert to XML
  - `yaml`, `yml` - Convert to YAML
  - `format` - Format JSON with indentation
  - `minify` - Minify JSON (remove whitespace)
- `-o, --output <file>` - Output file path (defaults to stdout)
- `-p, --pretty` - Pretty print output
- `-i, --indent <number>` - Indentation size (default: 2)
- `--root-name <name>` - Root element name for XML (default: "root")
- `--sort-keys` - Sort object keys alphabetically

### format

Format a JSON file or stdin.

```bash
polyconv format <input> [options]
```

#### Arguments

- `<input>` - Input file path or `-` for stdin

#### Options

- `-o, --output <file>` - Output file path (defaults to stdout)
- `-i, --indent <number>` - Indentation size (default: 2)
- `--sort-keys` - Sort object keys alphabetically

### minify

Minify a JSON file or stdin.

```bash
polyconv minify <input> [options]
```

#### Arguments

- `<input>` - Input file path or `-` for stdin

#### Options

- `-o, --output <file>` - Output file path (defaults to stdout)

## Examples

### JSON to XML

```bash
# Basic conversion
polyconv convert data.json --to xml --output data.xml

# With custom options
polyconv convert data.json --to xml \
  --root-name "users" \
  --pretty \
  --indent 4 \
  --output data.xml
```

### JSON to YAML

```bash
# Basic conversion
polyconv convert data.json --to yaml --output data.yaml

# With formatting
polyconv convert data.json --to yaml \
  --pretty \
  --indent 2 \
  --sort-keys \
  --output data.yaml
```

### Format JSON

```bash
# Format with default settings
polyconv format messy.json --output clean.json

# Custom indentation and sorted keys
polyconv format messy.json \
  --indent 4 \
  --sort-keys \
  --output clean.json
```

### Minify JSON

```bash
# Remove all whitespace
polyconv minify large.json --output small.json

# Or pipe through
cat large.json | polyconv minify - > small.json
```

### Pipeline Usage

```bash
# Fetch, convert, and save
curl https://api.example.com/users.json \
  | polyconv convert - --to yaml --pretty \
  | tee users.yaml

# Convert multiple files
for file in *.json; do
  polyconv convert "$file" --to yaml --output "${file%.json}.yaml"
done

# Chain conversions
cat data.json \
  | polyconv format - --sort-keys \
  | polyconv convert - --to yaml \
  > formatted.yaml
```

## Error Handling

The CLI provides clear error messages:

```bash
# Invalid format
$ polyconv convert data.json --to invalid
✗ Error: Unsupported target format: invalid. Supported formats: xml, yaml, yml, format, minify

# Invalid JSON
$ polyconv convert bad.json --to xml
✗ Conversion Error: Failed to parse JSON Context: {"preview":"{bad"} Caused by: Expected property name or '}' in JSON at position 1 (line 1 column 2)

# Missing file
$ polyconv convert missing.json --to yaml
✗ Error: Failed to read file: missing.json
```

Exit codes:

- `0` - Success
- `1` - Error (conversion failed, invalid input, etc.)

## Development

Link the CLI locally for development:

```bash
cd packages/cli
pnpm build
pnpm link --global

# Now you can use it
polyconv convert --help

# Unlink when done
pnpm unlink --global
```

## License

MIT
