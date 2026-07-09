# @polyconv/json

JSON conversion and formatting utilities for Polyconv. It converts JSON strings to XML, YAML, or TOML and also formats or minifies JSON.

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

## Installation

```bash
pnpm add @polyconv/json
```

This package is ESM-only and requires Node.js 22+.

## Features

- Convert JSON to XML with customizable options
- Convert JSON to YAML with formatting control
- Convert JSON to TOML
- Format and minify JSON
- Tree-shakeable exports
- Full TypeScript support
- Built on battle-tested libraries (fast-xml-builder, js-yaml)

## Usage

### JSON to XML

```typescript
import { jsonToXml, JsonToXmlConverter } from "@polyconv/json";

const json = '{"users": [{"name": "Alice", "age": 30}]}';

const xml = jsonToXml(json);

const prettyXml = jsonToXml(json, {
  rootName: "data",
  pretty: true,
  indent: 2,
  ignoreAttributes: false,
});

// Using the converter class
const converter = new JsonToXmlConverter();
const result = converter.convert(json, { pretty: true });
console.log(result.data); // XML string
console.log(result.format); // "xml"
```

### JSON to YAML

```typescript
import { jsonToYaml, JsonToYamlConverter } from "@polyconv/json";

const json = '{"name": "polyconv", "version": "1.0.0"}';

const yaml = jsonToYaml(json);

const sortedYaml = jsonToYaml(json, {
  indent: 2,
  lineWidth: 80,
  sortKeys: true,
  pretty: true,
});

// Using the converter class
const converter = new JsonToYamlConverter();
const result = converter.convert(json, { sortKeys: true });
```

### JSON to TOML

```typescript
import { jsonToToml, JsonToTomlConverter } from "@polyconv/json";

const json = '{"name":"polyconv","config":{"enabled":true}}';

const toml = jsonToToml(json, {
  sortKeys: true,
});

const converter = new JsonToTomlConverter();
const result = converter.convert(json);
```

### Format JSON

```typescript
import { formatJson, minifyJson } from "@polyconv/json";

const json = '{"name":"polyconv","version":"1.0.0"}';

const formatted = formatJson(json, {
  indent: 4,
  sortKeys: true,
});

const minified = minifyJson(json);
```

## API

### JSON to XML

```typescript
jsonToXml(input: string, options?: JsonToXmlOptions): string

interface JsonToXmlOptions {
  rootName?: string;              // Root element name (default: "root")
  pretty?: boolean;               // Pretty print (default: false)
  indent?: number;                // Indentation size (default: 2)
  ignoreAttributes?: boolean;     // Ignore attributes (default: false)
  attributeNamePrefix?: string;   // Attribute prefix (default: "@_")
  textNodeName?: string;          // Text node name (default: "#text")
  cdataTagName?: string;          // CDATA tag name
}
```

### JSON to YAML

```typescript
jsonToYaml(input: string, options?: JsonToYamlOptions): string

interface JsonToYamlOptions {
  pretty?: boolean;      // Pretty print (default: false)
  indent?: number;       // Indentation size (default: 2)
  lineWidth?: number;    // Max line width (default: 80)
  flowLevel?: number;    // Flow style level
  sortKeys?: boolean;    // Sort object keys (default: false)
  skipInvalid?: boolean; // Skip invalid values (default: false)
}
```

### JSON to TOML

```typescript
jsonToToml(input: string, options?: JsonToTomlOptions): string

interface JsonToTomlOptions {
  pretty?: boolean;
  indent?: number;
  sortKeys?: boolean; // Sort object keys (default: false)
}
```

### Format & Minify

```typescript
formatJson(input: string, options?: FormatOptions): string
minifyJson(input: string): string

interface FormatOptions {
  indent?: number;      // Indentation size (default: 2)
  sortKeys?: boolean;   // Sort object keys (default: false)
}
```

### Error Handling

```typescript
import { jsonToXml } from "@polyconv/json";
import { ConversionError } from "@polyconv/core";

try {
  const xml = jsonToXml(invalidJson);
} catch (error) {
  if (error instanceof ConversionError) {
    console.error(`Conversion failed: ${error.toString()}`);
    console.error(`Source: ${error.sourceFormat}`);
    console.error(`Target: ${error.targetFormat}`);
  }
}
```

## Input Contract

All helpers accept JSON as a string and throw `ConversionError` for invalid or empty input. Parse JSON into an object yourself only if you need to validate or transform the data before calling these helpers.

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@polyconv/json?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmx.dev/package/@polyconv/json
[license-src]: https://img.shields.io/github/license/wingkwong/polyconv.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wingkwong/polyconv/blob/develop/packages/json/LICENSE
