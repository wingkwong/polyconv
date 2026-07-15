# @polyconv/core

TypeScript converter utilities for building Polyconv-compatible libraries, including core types, conversion errors, and validation helpers.

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

## Installation

```bash
pnpm add @polyconv/core
```

This package is ESM-only and requires Node.js 22+.

## Features

- Base converter interfaces and abstract classes
- Type-safe conversion options and results
- Built-in error handling with `ConversionError`
- Validation utilities for JSON-oriented inputs
- Tree-shakeable ESM exports

## Usage

### Creating a Custom Converter

```typescript
import { BaseConverter, ConversionResult, ConversionOptions } from "@polyconv/core";

interface MyOptions extends ConversionOptions {
  customOption?: string;
}

class MyConverter extends BaseConverter<string, string, MyOptions> {
  readonly sourceFormat = "input";
  readonly targetFormat = "output";

  convert(input: string, options?: MyOptions): ConversionResult<string> {
    const output = input.toUpperCase();

    return this.createResult(output, {
      customOption: options?.customOption,
    });
  }

  validate(input: string): boolean {
    return typeof input === "string" && input.length > 0;
  }
}
```

### Using Validation Utilities

```typescript
import { validateJSONString, parseJSON, isValidJSON, validateNotEmpty } from "@polyconv/core";

// Validate JSON string
try {
  validateJSONString('{"valid": "json"}');
} catch (error) {
  console.error(error.message);
}

// Parse JSON safely
const data = parseJSON<{ name: string }>('{"name": "polyconv"}');

// Type guards
if (isValidJSON(data)) {
  console.log("Valid JSON data");
}

// Validate not empty
validateNotEmpty(input, "json");
```

### Error Handling

```typescript
import { ConversionError } from "@polyconv/core";

try {
  // Your conversion logic
} catch (error) {
  throw new ConversionError("Failed to convert data", {
    sourceFormat: "json",
    targetFormat: "xml",
    context: { detail: "Additional context" },
    cause: error,
  });
}
```

## API

### Types

- `ConversionOptions` - Base options for all converters
- `ConversionResult<T>` - Result of a conversion operation
- `Converter<TInput, TOutput, TOptions>` - Converter contract

### Classes

- `BaseConverter` - Abstract base class for implementing converters
- `ConversionError` - Custom error class with rich context

### Utilities

- `isPlainObject(value)` - Type guard for plain objects
- `isValidJSON(value)` - Type guard for valid JSON values
- `validateJSONString(input)` - Validate a JSON string
- `parseJSON<T>(input)` - Safely parse JSON with better errors
- `validateNotEmpty(input, format)` - Validate input is not empty

## Related Packages

- `@polyconv/json` uses these helpers for JSON conversion, formatting, and minifying.
- `@polyconv/cli` uses these errors to print consistent CLI failures.

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@polyconv/core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmx.dev/package/@polyconv/core
[license-src]: https://img.shields.io/github/license/wingkwong/polyconv.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wingkwong/polyconv/blob/develop/packages/core/LICENSE
