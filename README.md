<br>
<p align="center">
  <a href="https://wingkwong.github.io/polyconv/">
    <img width="250" height="250" alt="polyconv" src="https://github.com/user-attachments/assets/5242709b-8f13-40f0-a99e-2469566d9bb8" />
  </a>
</p>

<p align="center">
Polyconv is a modular TypeScript toolkit for structured data format conversion from the command line or library APIs. It provides focused packages for working with JSON, TOML, YAML, XML, CSV, TSV, INI, ENV, Markdown, HTML, and URL query string formats.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@polyconv/core" target="__blank"><img src="https://img.shields.io/npm/v/@polyconv/core?color=FF6B6B&label=core" alt="@polyconv/core version"></a>
<a href="https://www.npmjs.com/package/@polyconv/json" target="__blank"><img src="https://img.shields.io/npm/v/@polyconv/json?color=1ABC9C&label=json" alt="@polyconv/json version"></a>
<a href="https://www.npmjs.com/package/@polyconv/toml" target="__blank"><img src="https://img.shields.io/npm/v/@polyconv/toml?color=9B59B6&label=toml" alt="@polyconv/toml version"></a>
<a href="https://www.npmjs.com/package/@polyconv/cli" target="__blank"><img src="https://img.shields.io/npm/v/@polyconv/cli?color=FFC300&label=cli" alt="@polyconv/cli version"></a>
</p>

## Supported Conversions

| Source | Target                 | CLI             | TypeScript library |
| ------ | ---------------------- | --------------- | ------------------ |
| JSON   | XML                    | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | YAML                   | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | TOML                   | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | CSV / TSV              | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | INI / ENV              | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | Markdown / HTML tables | `@polyconv/cli` | `@polyconv/json`   |
| JSON   | URL query string       | `@polyconv/cli` | `@polyconv/json`   |
| TOML   | JSON                   | `@polyconv/cli` | `@polyconv/toml`   |

## Features

- Focused converters for structured data formats including JSON, TOML, YAML, XML, CSV, TSV, INI, ENV, Markdown, HTML, and query strings
- CLI and TypeScript library APIs for supported conversion paths
- JSON formatting and minifying
- Fast ESM packages built with tsup and esbuild
- Modular package layout so consumers can install only what they need
- TypeScript declarations for public APIs
- CLI and programmatic APIs
- Node.js 22+ runtime support

## Packages

- [@polyconv/cli](packages/cli) - Command-line interface for supported conversions, formatting, and minifying
- [@polyconv/core](packages/core) - Core types, errors, and validation helpers for converters
- [@polyconv/json](packages/json) - JSON converters and JSON formatting utilities
- [@polyconv/toml](packages/toml) - TOML converter package

## Requirements

- Node.js 22+
- pnpm 11.9.0 for repository development

## Quick Start

### Installation

```bash
# Install CLI globally
pnpm add -g @polyconv/cli

# Or use in a project
pnpm add @polyconv/json
```

Packages are ESM-only.

### CLI Usage (Example)

```bash
# Convert JSON to XML
polyconv convert input.json --to xml --output output.xml

# Convert JSON to YAML with pretty formatting
polyconv convert input.json --to yaml --pretty --output output.yaml

# Convert JSON to TOML, CSV, TSV, INI, ENV, Markdown, HTML, or query strings
polyconv convert input.json --to toml --output output.toml
polyconv convert input.json --to csv --output output.csv
polyconv convert input.json --to query

# Convert TOML to JSON
polyconv convert input.toml --to json --output output.json

# Format JSON
polyconv format input.json --indent 2 --sort-keys --output formatted.json

# Minify JSON
polyconv minify input.json --output minified.json

# Read from stdin, write to stdout
cat input.json | polyconv convert - --from json --to yaml
```

### Programmatic Usage (Example)

```typescript
import {
  formatJson,
  jsonToCsv,
  jsonToQueryString,
  jsonToToml,
  jsonToXml,
  jsonToYaml,
} from "@polyconv/json";

const jsonData = '{"name": "polyconv", "version": "1.0.0"}';

// Convert to XML
const xml = jsonToXml(jsonData, {
  rootName: "package",
  pretty: true,
  indent: 2,
});

// Convert to YAML
const yaml = jsonToYaml(jsonData, {
  indent: 2,
  sortKeys: true,
});

// Convert to TOML
const toml = jsonToToml(jsonData, {
  sortKeys: true,
});

// Convert to CSV
const csv = jsonToCsv('[{"name":"polyconv","version":"1.0.0"}]');

// Convert to a URL query string
const query = jsonToQueryString('{"q":"polyconv","tag":["json","cli"]}');

// Format JSON
const formatted = formatJson(jsonData, {
  indent: 4,
  sortKeys: true,
});
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/wingkwong/polyconv.git
cd polyconv

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Project Structure

```
polyconv/
├── packages/
│   ├── cli/         # Command-line interface
│   ├── core/        # Core types and utilities
│   ├── json/        # JSON conversion package
│   ├── toml/        # TOML converter package
│   └── standard/    # Shared TypeScript configs
├── turbo.json       # Turborepo configuration
└── pnpm-workspace.yaml
```

### Commands

```bash
pnpm dev          # Run all packages in dev mode
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
pnpm test         # Run all tests
pnpm format:check # Check Prettier formatting
pnpm format       # Format code with Prettier
pnpm clean        # Clean build artifacts
```

CI runs formatting, linting, type checking, build, and tests on pushes and pull requests to
`develop` and `main`. Use `develop` as the default integration branch and `main` as the
production branch.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT
