import assert from "node:assert/strict";
import test from "node:test";

import { ConversionError } from "@polyconv/core";
import { TomlToJsonConverter, tomlToJson } from "../dist/index.js";

test("tomlToJson converts a basic document", () => {
  const json = tomlToJson('name = "polyconv"\nversion = "1.0.0"\nactive = true\n', {
    pretty: true,
    sortKeys: true,
  });

  assert.equal(json, '{\n  "active": true,\n  "name": "polyconv",\n  "version": "1.0.0"\n}');
});

test("tomlToJson supports nested tables and arrays", () => {
  const json = tomlToJson('ports = [8000, 8001]\n\n[package]\nname = "polyconv"\n');

  assert.equal(json, '{"ports":[8000,8001],"package":{"name":"polyconv"}}');
});

test("tomlToJson rejects invalid TOML", () => {
  assert.throws(() => tomlToJson("name = "), ConversionError);
});

test("TomlToJsonConverter validates input", () => {
  const converter = new TomlToJsonConverter();

  assert.equal(converter.validate('name = "polyconv"'), true);
  assert.equal(converter.validate("name = "), false);
  assert.equal(converter.validate(" "), false);
});
