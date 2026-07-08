import assert from "node:assert/strict";
import test from "node:test";

import {
  JsonToXmlConverter,
  JsonToYamlConverter,
  formatJson,
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

test("formatJson and minifyJson transform JSON output", () => {
  const formatted = formatJson('{"b":2,"a":1}', { sortKeys: true, indent: 2 });
  const minified = minifyJson('{ "a": 1, "b": [1, 2] }');

  assert.equal(formatted, '{\n  "a": 1,\n  "b": 2\n}');
  assert.equal(minified, '{"a":1,"b":[1,2]}');
});

test("JsonToXmlConverter and JsonToYamlConverter validate input", () => {
  const xmlConverter = new JsonToXmlConverter();
  const yamlConverter = new JsonToYamlConverter();

  assert.equal(xmlConverter.validate('{"ok":true}'), true);
  assert.equal(xmlConverter.validate("{invalid"), false);
  assert.equal(yamlConverter.validate('{"ok":true}'), true);
  assert.equal(yamlConverter.validate(" "), false);
});
