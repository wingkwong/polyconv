import assert from "node:assert/strict";
import test from "node:test";

import { ConversionError } from "@polyconv/core";
import {
  JsonToCsvConverter,
  JsonToEnvConverter,
  JsonToHtmlTableConverter,
  JsonToIniConverter,
  JsonToMarkdownTableConverter,
  JsonToQueryStringConverter,
  JsonToTomlConverter,
  JsonToTsvConverter,
  JsonToXmlConverter,
  JsonToYamlConverter,
  formatJson,
  jsonToCsv,
  jsonToEnv,
  jsonToHtmlTable,
  jsonToIni,
  jsonToMarkdownTable,
  jsonToQueryString,
  jsonToToml,
  jsonToTsv,
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

test("jsonToCsv converts object and array table inputs", () => {
  assert.equal(jsonToCsv('{"name":"Alice","age":30}'), "name,age\nAlice,30\n");

  const csv = jsonToCsv('[{"name":"Alice","age":30},{"name":"Bob","active":true,"age":null}]');
  assert.equal(csv, "name,age,active\nAlice,30,\nBob,,true\n");
});

test("jsonToCsv supports sorting and escaping", () => {
  const csv = jsonToCsv('{"note":"line\\nnext","name":"A, \\"B\\""}', { sortKeys: true });
  assert.equal(csv, 'name,note\n"A, ""B""","line\nnext"\n');
});

test("jsonToTsv converts table inputs and escapes TSV cells", () => {
  const tsv = jsonToTsv('[{"b":"two\\tcolumns","a":1},{"a":2,"b":"quote \\"ok\\""}]', {
    sortKeys: true,
  });

  assert.equal(tsv, 'a\tb\n1\t"two\tcolumns"\n2\t"quote ""ok"""\n');
});

test("table converters reject nested table cells", () => {
  assert.throws(() => jsonToCsv('{"name":"polyconv","meta":{"ok":true}}'), ConversionError);
  assert.throws(() => jsonToTsv('{"name":"polyconv","tags":["a"]}'), ConversionError);
  assert.throws(() => jsonToMarkdownTable('{"name":"polyconv","tags":["a"]}'), ConversionError);
  assert.throws(() => jsonToHtmlTable('{"name":"polyconv","meta":{"ok":true}}'), ConversionError);
});

test("jsonToMarkdownTable converts and escapes table content", () => {
  const markdown = jsonToMarkdownTable(
    '[{"name":"Alice|Bob","note":"line\\nnext"},{"name":"Carol"}]'
  );

  assert.equal(
    markdown,
    "| name | note |\n| --- | --- |\n| Alice\\|Bob | line<br>next |\n| Carol |  |\n"
  );
});

test("jsonToHtmlTable converts and escapes table content", () => {
  const html = jsonToHtmlTable('{"name":"<Alice & Bob>","quote":"\\"hello\\""}', {
    sortKeys: true,
  });

  assert.equal(
    html,
    "<table>\n<thead>\n<tr><th>name</th><th>quote</th></tr>\n</thead>\n<tbody>\n<tr><td>&lt;Alice &amp; Bob&gt;</td><td>&quot;hello&quot;</td></tr>\n</tbody>\n</table>\n"
  );
});

test("jsonToIni converts root keys and recursive dotted sections", () => {
  const ini = jsonToIni(
    '{"name":"polyconv","database":{"host":"localhost","replica":{"enabled":true,"port":5432}}}'
  );

  assert.equal(
    ini,
    "name=polyconv\n\n[database]\nhost=localhost\n\n[database.replica]\nenabled=true\nport=5432\n"
  );
});

test("jsonToIni supports recursive key sorting and rejects unsupported values", () => {
  assert.equal(
    jsonToIni('{"b":2,"a":{"d":4,"c":3}}', { sortKeys: true }),
    "b=2\n\n[a]\nc=3\nd=4\n"
  );
  assert.throws(() => jsonToIni('{"items":[1]}'), ConversionError);
  assert.throws(() => jsonToIni('{"empty":null}'), ConversionError);
  assert.throws(() => jsonToIni('[{"name":"polyconv"}]'), ConversionError);
});

test("jsonToEnv converts scalar objects, sorts, quotes, and validates keys", () => {
  const env = jsonToEnv('{"PLAIN":"value","SPACED":"hello world","COMMENT":"#tag","COUNT":2}', {
    sortKeys: true,
  });

  assert.equal(env, 'COMMENT="#tag"\nCOUNT=2\nPLAIN=value\nSPACED="hello world"\n');
  assert.equal(
    jsonToEnv('{"MULTI":"line\\nnext","QUOTE":"say \\"hi\\""}'),
    'MULTI="line\\nnext"\nQUOTE="say \\"hi\\""\n'
  );
  assert.throws(() => jsonToEnv('{"1BAD":"value"}'), ConversionError);
  assert.throws(() => jsonToEnv('{"NULL":null}'), ConversionError);
  assert.throws(() => jsonToEnv('{"NESTED":{"ok":true}}'), ConversionError);
});

test("jsonToQueryString converts scalar and repeated array parameters", () => {
  const query = jsonToQueryString(
    '{"q":"hello world","page":2,"active":true,"empty":null,"tag":["a&b","c"]}',
    {
      sortKeys: true,
    }
  );

  assert.equal(query, "active=true&empty=&page=2&q=hello+world&tag=a%26b&tag=c");
  assert.equal(
    jsonToQueryString('{"symbols":"!*\'()~ "}', { sortKeys: true }),
    "symbols=%21*%27%28%29%7E+"
  );
  assert.throws(() => jsonToQueryString('{"nested":{"ok":true}}'), ConversionError);
  assert.throws(() => jsonToQueryString('{"bad":[{"ok":true}]}'), ConversionError);
  assert.throws(() => jsonToQueryString("[1,2]"), ConversionError);
});

test("formatJson and minifyJson transform JSON output", () => {
  const formatted = formatJson('{"b":2,"a":1}', { sortKeys: true, indent: 2 });
  const minified = minifyJson('{ "a": 1, "b": [1, 2] }');

  assert.equal(formatted, '{\n  "a": 1,\n  "b": 2\n}');
  assert.equal(minified, '{"a":1,"b":[1,2]}');
});

test("JSON converters validate input", () => {
  const csvConverter = new JsonToCsvConverter();
  const envConverter = new JsonToEnvConverter();
  const htmlConverter = new JsonToHtmlTableConverter();
  const iniConverter = new JsonToIniConverter();
  const markdownConverter = new JsonToMarkdownTableConverter();
  const queryConverter = new JsonToQueryStringConverter();
  const tomlConverter = new JsonToTomlConverter();
  const tsvConverter = new JsonToTsvConverter();
  const xmlConverter = new JsonToXmlConverter();
  const yamlConverter = new JsonToYamlConverter();

  assert.equal(csvConverter.validate('[{"ok":true}]'), true);
  assert.equal(csvConverter.validate('{"nested":{"ok":true}}'), false);
  assert.equal(tsvConverter.validate('{"ok":true}'), true);
  assert.equal(tsvConverter.validate("[1,2]"), false);
  assert.equal(iniConverter.validate('{"ok":true,"section":{"value":1}}'), true);
  assert.equal(iniConverter.validate('{"ok":null}'), false);
  assert.equal(envConverter.validate('{"OK":true}'), true);
  assert.equal(envConverter.validate('{"bad-key":true}'), false);
  assert.equal(markdownConverter.validate('[{"ok":true}]'), true);
  assert.equal(markdownConverter.validate('{"nested":{"ok":true}}'), false);
  assert.equal(htmlConverter.validate('[{"ok":true}]'), true);
  assert.equal(htmlConverter.validate('{"nested":{"ok":true}}'), false);
  assert.equal(queryConverter.validate('{"ok":[true,null]}'), true);
  assert.equal(queryConverter.validate('{"nested":{"ok":true}}'), false);
  assert.equal(tomlConverter.validate('{"ok":true}'), true);
  assert.equal(tomlConverter.validate("[1,2]"), false);
  assert.equal(tomlConverter.validate("{invalid"), false);
  assert.equal(tomlConverter.validate(" "), false);
  assert.equal(xmlConverter.validate('{"ok":true}'), true);
  assert.equal(xmlConverter.validate("{invalid"), false);
  assert.equal(yamlConverter.validate('{"ok":true}'), true);
  assert.equal(yamlConverter.validate(" "), false);
});
