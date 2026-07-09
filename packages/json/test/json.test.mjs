import assert from "node:assert/strict";
import test from "node:test";

import { ConversionError } from "@polyconv/core";
import {
  JsonToTomlConverter,
  JsonToXmlConverter,
  JsonToYamlConverter,
  formatJson,
  jsonToToml,
  jsonToXml,
  jsonToYaml,
  minifyJson,
} from "../dist/index.js";

test("jsonToXml converts JSON object to XML with default root wrapping", () => {
  const xml = jsonToXml('{"name":"polyconv","version":1}');

  assert.match(xml, /<root>/);
  assert.match(xml, /<name>polyconv<\/name>/);
  assert.match(xml, /<version>1<\/version>/);
});

test("jsonToYaml converts JSON and supports key sorting", () => {
  const yaml = jsonToYaml('{"b":2,"a":1}', { sortKeys: true });

  assert.equal(yaml, "a: 1\nb: 2\n");
});

test("jsonToToml converts a basic object", () => {
  const toml = jsonToToml('{"name":"polyconv","version":"1.0.0","active":true}', {
    sortKeys: true,
  });

  assert.match(toml, /active = true/);
  assert.match(toml, /name = "polyconv"/);
  assert.match(toml, /version = "1.0.0"/);
});

test("jsonToToml supports nested objects and arrays", () => {
  const toml = jsonToToml('{"package":{"name":"polyconv"},"ports":[8000,8001]}');

  assert.match(toml, /ports = \[8000, 8001\]/);
  assert.match(toml, /\[package\]/);
  assert.match(toml, /name = "polyconv"/);
});

test("jsonToToml throws when a value cannot be represented", () => {
  assert.throws(() => jsonToToml('{"name":"polyconv","empty":null}'), ConversionError);
});

test("jsonToToml rejects top-level arrays and primitives", () => {
  assert.throws(() => jsonToToml('[{"name":"polyconv"}]'), ConversionError);
  assert.throws(() => jsonToToml('"polyconv"'), ConversionError);
});

test("formatJson and minifyJson transform JSON output", () => {
  const formatted = formatJson('{"b":2,"a":1}', { sortKeys: true, indent: 2 });
  const minified = minifyJson('{ "a": 1, "b": [1, 2] }');

  assert.equal(formatted, '{\n  "a": 1,\n  "b": 2\n}');
  assert.equal(minified, '{"a":1,"b":[1,2]}');
});

test("JSON converters validate input", () => {
  const tomlConverter = new JsonToTomlConverter();
  const xmlConverter = new JsonToXmlConverter();
  const yamlConverter = new JsonToYamlConverter();

  assert.equal(tomlConverter.validate('{"ok":true}'), true);
  assert.equal(tomlConverter.validate("[1,2]"), false);
  assert.equal(tomlConverter.validate("{invalid"), false);
  assert.equal(tomlConverter.validate(" "), false);
  assert.equal(xmlConverter.validate('{"ok":true}'), true);
  assert.equal(xmlConverter.validate("{invalid"), false);
  assert.equal(yamlConverter.validate('{"ok":true}'), true);
  assert.equal(yamlConverter.validate(" "), false);
});
