# @polyconv/toml

TOML conversion utilities for Polyconv.

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

## Installation

```bash
pnpm add @polyconv/toml
```

This package is ESM-only and requires Node.js 22+.

## Features

- Convert TOML strings to JSON
- Optional pretty output and recursive key sorting
- Tree-shakeable exports
- Full TypeScript support

## Usage

```typescript
import { tomlToJson, TomlToJsonConverter } from "@polyconv/toml";

const toml = 'name = "polyconv"\n\n[config]\nenabled = true\n';

const json = tomlToJson(toml, {
  pretty: true,
  sortKeys: true,
});

const converter = new TomlToJsonConverter();
const result = converter.convert(toml);
console.log(result.data);
console.log(result.format); // "json"
```

## API

```typescript
tomlToJson(input: string, options?: TomlToJsonOptions): string

interface TomlToJsonOptions {
  pretty?: boolean;
  indent?: number;
  sortKeys?: boolean; // Sort object keys (default: false)
}
```

## Input Contract

`tomlToJson` accepts TOML as a string. Empty input and invalid TOML throw `ConversionError`.

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@polyconv/toml?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmx.dev/package/@polyconv/toml
[license-src]: https://img.shields.io/github/license/wingkwong/polyconv.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wingkwong/polyconv/blob/develop/packages/toml/LICENSE
