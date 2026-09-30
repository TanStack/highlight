import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

// Run from an installed package consumer, not the source checkout.
const require = createRequire(`${process.cwd()}/consumer.cjs`)
const entry = require.resolve('@tanstack/highlight')
const root = new URL('../', `file://${entry}`)
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const entries = Object.keys(pkg.exports).flatMap(key => {
  if (!key.includes('*')) return [key === '.' ? pkg.name : pkg.name + key.slice(1)]
  const directory = key.slice(2, key.indexOf('*'))
  return readdirSync(new URL(`dist/${directory}`, root))
    .filter(file => file.endsWith('.js'))
    .map(file => `${pkg.name}/${directory}${file.slice(0, -3)}`)
})
// Imports resolve relative to this generated consumer module.
const moduleSource = `
import assert from 'node:assert/strict';
const modules = await Promise.all(${JSON.stringify(entries)}.map(entry => import(entry)));
const { highlight, listLanguages } = modules[0];
const inputs = [
  '<script>alert("x")</script> & \\"',
  '/*' + '*'.repeat(20000),
  '\\x60' + '\\x24{'.repeat(100),
  '<'.repeat(10000),
  '('.repeat(10000),
  'a'.repeat(20000) + ':',
  '😀\\r\\nconst x = { default: true }\\n',
];
for (const lang of listLanguages()) {
  for (const code of inputs) {
    const result = highlight(code, { lang });
    assert.equal(result.tokens.map(token => token.value).join(''), code);
    assert.ok(!result.html.includes('<script>'));
    const recovered = result.html.replace(/<[^>]*>/g, '')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '\"')
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    assert.equal(recovered, code, lang + ' escaped HTML must preserve source');
  }
}
const {createHighlighter} = await import('@tanstack/highlight/core');
const {ts} = await import('@tanstack/highlight/languages/ts');
const highlighter = createHighlighter({languages:[ts]});
const result = highlighter.highlight('const value = 1', {lang:'ts'});
assert.ok(result.html.includes('th-keyword'));
assert.equal(highlighter.highlight('<unsafe>', {lang:'unknown'}).html.includes('<unsafe>'), false);
console.log('Installed '+${JSON.stringify(pkg.name + '@' + pkg.version)}+': '+modules.length+' exports, all-language bounded hostile-input checks, and selective quick start passed on '+process.version);
`
const result = spawnSync(process.execPath, ['--input-type=module', '-e', moduleSource], {
  cwd: process.cwd(), encoding: 'utf8', timeout: 20000,
})
assert.ifError(result.error)
assert.equal(result.status, 0, result.stderr)
console.log(result.stdout.trim())
