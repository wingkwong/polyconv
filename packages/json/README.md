# @polyconv/json

JSON conversion and formatting utilities for Polyconv. It converts JSON strings to XML or YAML and also formats or minifies JSON.

## Installation

```bash
pnpm add @polyconv/json
```

This package is ESM-only and requires Node.js 22+.

## Features

- Convert JSON to XML with customizable options
- Convert JSON to YAML with formatting control
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

### Format & Minify

```typescript
formatJson(input: string, options?: FormatOptions): string
minifyJson(input: string): string

interface FormatOptions {
  indent?: number;      // Indentation size (default: 2)
  sortKeys?: boolean;   // Sort object keys (default: false)
}
```

## Examples

### CLI Integration

This package is used by `@polyconv/cli`:

```bash
# Convert JSON to XML
polyconv convert data.json --to xml --root-name users --pretty

# Convert JSON to YAML
polyconv convert data.json --to yaml --sort-keys --indent 4

# Format JSON
polyconv format messy.json --indent 2 --sort-keys

# Minify JSON
polyconv minify large.json --output small.json
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
