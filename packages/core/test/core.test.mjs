import assert from "node:assert/strict";
import test from "node:test";

import {
  ConversionError,
  isPlainObject,
  isValidJSON,
  parseJSON,
  validateJSONString,
  validateNotEmpty,
} from "../dist/index.js";

test("ConversionError stores metadata and formats string output", () => {
  const cause = new Error("root-cause");
  const error = new ConversionError("Failed conversion", {
    sourceFormat: "json",
    targetFormat: "xml",
    context: { field: "name" },
    cause,
  });

  assert.equal(error.name, "ConversionError");
  assert.equal(error.sourceFormat, "json");
  assert.equal(error.targetFormat, "xml");
  assert.deepEqual(error.context, { field: "name" });
  assert.equal(error.cause, cause);
  assert.equal(
    error.toString(),
    'Failed conversion (json → xml) Context: {"field":"name"} Caused by: root-cause'
  );
});

test("isPlainObject and isValidJSON validate values correctly", () => {
  assert.equal(isPlainObject({ a: 1 }), true);
  assert.equal(isPlainObject([1, 2, 3]), false);
  assert.equal(isPlainObject(null), false);

  assert.equal(isValidJSON({ a: [1, "x", true, null] }), true);
  assert.equal(isValidJSON(() => "nope"), false);
  assert.equal(isValidJSON({ bad: Symbol("x") }), false);
});

test("validateJSONString throws ConversionError for invalid JSON", () => {
  assert.throws(
    () => validateJSONString("{not-valid-json"),
    (error) => {
      assert.ok(error instanceof ConversionError);
      assert.equal(error.message, "Invalid JSON string");
      assert.equal(error.sourceFormat, "json");
      assert.ok(error.context);
      return true;
    }
  );
});

test("parseJSON parses valid JSON and throws ConversionError for invalid input", () => {
  const parsed = parseJSON('{"name":"polyconv","active":true}');
  assert.deepEqual(parsed, { name: "polyconv", active: true });

  assert.throws(
    () => parseJSON("{invalid"),
    (error) => {
      assert.ok(error instanceof ConversionError);
      assert.equal(error.message, "Failed to parse JSON");
      assert.equal(error.sourceFormat, "json");
      return true;
    }
  );
});

test("validateNotEmpty accepts non-empty input and rejects empty input", () => {
  validateNotEmpty("{}", "json");

  assert.throws(
    () => validateNotEmpty("   ", "json"),
    (error) => {
      assert.ok(error instanceof ConversionError);
      assert.equal(error.message, "Input cannot be empty");
      assert.equal(error.sourceFormat, "json");
      return true;
    }
  );
});
