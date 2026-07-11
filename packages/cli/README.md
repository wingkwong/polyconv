# @polyconv/cli

Command-line interface for Polyconv.

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

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

# Convert TOML to JSON
polyconv convert input.toml --to json --output output.json

# Convert JSON to YAML
polyconv convert input.json --to yaml --output output.yaml

# Convert JSON to TOML
polyconv convert input.json --to toml --output output.toml

# Convert JSON to CSV
polyconv convert input.json --to csv --output output.csv

# Convert JSON to ENV
polyconv convert input.json --to env --output .env

# Convert JSON to a query string
polyconv convert input.json --to query

# Format JSON
polyconv format input.json --indent 2 --sort-keys --output formatted.json

# Minify JSON
polyconv minify input.json --output minified.json
```

### Options

```bash
# Pretty print supported outputs
polyconv convert input.json --to yaml --pretty

# Custom indentation for supported formatted outputs
polyconv convert input.json --to yaml --indent 4

# Sort object keys
polyconv convert input.json --to yaml --sort-keys

# Custom XML root element name
polyconv convert input.json --to xml --root-name data
```

### Stdin/Stdout

```bash
# Read from stdin, write to stdout
cat input.json | polyconv convert - --from json --to yaml

# Pipe through multiple commands
curl https://api.example.com/data.json | polyconv convert - --from json --to yaml | less

# Read from stdin, write to file
cat input.json | polyconv convert - --from json --to xml --output output.xml

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

- `-f, --from <format>` - Source format (`json`, `toml`). Inferred from file extension for file input.
- `-t, --to <format>` - Target format (required)
  - `json` - Convert to JSON
  - `xml` - Convert to XML
  - `yaml`, `yml` - Convert to YAML
  - `toml` - Convert to TOML
  - `csv` - Convert to CSV
  - `tsv` - Convert to TSV
  - `ini` - Convert to INI
  - `env` - Convert to ENV
  - `markdown` - Convert to a Markdown table
  - `html` - Convert to an HTML table
  - `query` - Convert to a URL query string
- `-o, --output <file>` - Output file path (defaults to stdout)
- `-p, --pretty` - Pretty print supported outputs such as XML and YAML
- `-i, --indent <number>` - Indentation size for supported formatted outputs (default: 2)
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

### TOML to JSON

```bash
# Source format is inferred from .toml
polyconv convert config.toml --to json --output config.json

# Stdin requires an explicit source format
cat config.toml | polyconv convert - --from toml --to json
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

### JSON to TOML

```bash
# Basic conversion
polyconv convert data.json --to toml --output data.toml

# With sorted keys
polyconv convert data.json --to toml \
  --sort-keys \
  --output data.toml
```

### JSON to CSV / TSV / Tables

```bash
# CSV and TSV use object keys as headers
polyconv convert data.json --to csv --output data.csv
polyconv convert data.json --to tsv --output data.tsv

# Markdown and HTML table markup
polyconv convert data.json --to markdown --output table.md
polyconv convert data.json --to html --output table.html
```

### JSON to INI / ENV / Query String

```bash
polyconv convert config.json --to ini --output config.ini
polyconv convert config.json --to env --output .env
polyconv convert params.json --to query
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
  | polyconv convert - --from json --to yaml --pretty \
  | tee users.yaml

# Convert multiple files
for file in *.json; do
  polyconv convert "$file" --to yaml --output "${file%.json}.yaml"
done

# Chain conversions
cat data.json \
  | polyconv format - --sort-keys \
  | polyconv convert - --from json --to yaml \
  > formatted.yaml
```

## Error Handling

The CLI provides clear error messages:

```bash
# Invalid format
$ polyconv convert data.json --to invalid
✗ Error: Unsupported target format: invalid. Supported formats: json, xml, yaml, yml, toml, csv, tsv, ini, env, markdown, html, query

# Missing stdin source format
$ cat data.json | polyconv convert - --to yaml
✗ Error: Source format is required for stdin. Use --from <format>

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

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@polyconv/cli?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmx.dev/package/@polyconv/cli
[license-src]: https://img.shields.io/github/license/wingkwong/polyconv.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wingkwong/polyconv/blob/develop/packages/cli/LICENSE
