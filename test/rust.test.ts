import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { rust } from '../src/languages/rust'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [rust] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'rust')

const showcase = `//! A tiny in-memory cache.
#![allow(dead_code)]
use std::collections::HashMap;

/// Errors returned by [\`Cache::get\`]. Don't unwrap them.
#[derive(Debug, Clone, PartialEq)]
pub enum CacheError {
    Missing(String),
    Expired { age: u64 },
}

#[cfg(feature = "serde")]
pub struct Cache<'a, V: Clone> {
    entries: HashMap<&'a str, V>,
    hits: usize,
}

impl<'a, V: Clone> Cache<'a, V> {
    pub fn new() -> Self {
        Self { entries: HashMap::new(), hits: 0 }
    }

    pub fn get(&mut self, key: &'a str) -> Result<V, CacheError> {
        let value = self.entries.get(key).cloned();
        self.hits += 1;
        value.ok_or_else(|| CacheError::Missing(format!("no key '{}'", key)))
    }
}

pub async fn warm(cache: &mut Cache<'static, String>) -> Option<usize> {
    let keys: Vec<_> = (0..10).map(|i| i.to_string()).collect::<Vec<_>>();
    for key in keys.iter() {
        if key.starts_with('1') { continue; }
        println!("warming {key}");
    }
    let ratio = 1.5e-3f64 * cache.hits as f64;
    Some(cache.hits)
}
`

describe('Rust documentation syntax', () => {
  it('highlights a realistic showcase sample', () => {
    expect(classes(showcase, '//! A tiny')).toEqual(['comment'])
    expect(classes(showcase, "/// Errors returned by [`Cache::get`]. Don't unwrap them.")).toEqual(['comment'])
    expect(classes(showcase, '#![allow')).toEqual(['attr'])
    expect(classes(showcase, '#[derive(Debug, Clone')).toEqual(['attr', undefined, 'type', undefined, 'type'])
    expect(classes(showcase, '"serde"')).toEqual(['string'])
    expect(classes(showcase, 'HashMap;')).toEqual(['type', undefined])
    expect(classes(showcase, 'pub enum CacheError')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(showcase, "<'a, V: Clone")).toEqual(['operator', 'meta', undefined, 'type'])
    expect(classes(showcase, "&'a str")).toEqual(['operator', 'meta', undefined, 'type'])
    expect(classes(showcase, 'fn new() -> Self')).toEqual(['keyword', undefined, 'function', undefined, 'operator', undefined, 'type'])
    expect(classes(showcase, '&mut self')).toEqual(['operator', 'keyword', undefined, 'keyword'])
    expect(classes(showcase, 'entries.get(')).toEqual(['property', undefined, 'function', undefined])
    expect(classes(showcase, 'format!("no key \'{}\'", key)')).toEqual(['function', undefined, 'string', undefined])
    expect(classes(showcase, "'static")).toEqual(['meta'])
    expect(classes(showcase, '0..10')).toEqual(['number', 'operator', 'number'])
    expect(classes(showcase, '|i|')).toEqual(['operator', undefined, 'operator'])
    expect(classes(showcase, 'collect::<Vec')).toEqual(['function', 'operator', 'operator', 'type'])
    expect(classes(showcase, "'1'")).toEqual(['string'])
    expect(classes(showcase, '"warming {key}"')).toEqual(['string'])
    expect(classes(showcase, '1.5e-3f64')).toEqual(['number'])
    expect(classes(showcase, 'as f64')).toEqual(['keyword', undefined, 'type'])
    expect(classes(showcase, 'async fn warm')).toEqual(['keyword', undefined, 'keyword', undefined, 'function'])
  })

  it('separates lifetimes and labels from character literals', () => {
    const code = "impl<'a> Foo<'a> { fn f<'b, T>(x: &'b str) -> &'static str { 'outer: loop { break 'outer; } } }"
    expect(classes(code, "impl<'a> Foo<'a> {")).toEqual(['keyword', 'operator', 'meta', 'operator', undefined, 'type', 'operator', 'meta', 'operator', undefined])
    expect(classes(code, "<'b, T>")).toEqual(['operator', 'meta', undefined, 'operator'])
    expect(classes(code, "'outer: loop")).toEqual(['meta', undefined, 'keyword'])
    expect(classes(code, "break 'outer;")).toEqual(['keyword', undefined, 'meta', undefined])
    for (const char of ["'a'", "'\\x41'", "'\\n'", "'\\''", "'\\u{1F600}'", "'😀'", "b'x'", "b'\\\\'", "'\"'"]) {
      expect(classes(`let c = ${char}; let s: &'a str = x;`, char), char).toEqual(['string'])
    }
    expect(classes("match c { 'a'..='z' => 1, _ => 0 }", "'a'..='z'")).toEqual(['string', 'operator', 'string'])
  })

  it('matches raw string hash counts and byte/C string prefixes', () => {
    for (const string of ['r"C:\\path\\"', 'r#"a "quoted" // x"#', 'r##"a "# b"##', 'b"bytes\\n"', 'br#"raw "b""#', 'c"cstr"', 'cr"x"']) {
      expect(classes(`let s = ${string}; let n = 1;`, string), string).toEqual(['string'])
      expect(classes(`let s = ${string}; let n = 1;`, 'n = 1'), string).toEqual([undefined, 'operator', undefined, 'number'])
    }
    const multiline = 'let s = "first \\" /* not\nsecond \\\n  third // still";\nlet t = 1;'
    expect(classes(multiline, multiline.slice(8, multiline.indexOf(';')))).toEqual(['string'])
    expect(classes(multiline, 'let t')).toEqual(['keyword', undefined])
    expect(classes('let s = "it\'s \'a fn"; let c = \'"\';', '"it\'s \'a fn"')).toEqual(['string'])
    expect(classes('fn largest<T: PartialOrd>(list: &[T]) -> &T {}', 'largest<T: PartialOrd>(')).toEqual(['function', 'operator', undefined, 'type', 'operator', undefined])
    expect(classes('let s = r#"unterminated " x', 'r#"unterminated " x')).toEqual(['string'])
    const adjacent = 'let a = "\\\\"; let r = r"\\"; let h = br##"x"#y"##; let f = format!("{name:>8.3}"); let z = concat!(r"a",b"b");'
    for (const string of ['"\\\\"', 'r"\\"', 'br##"x"#y"##', '"{name:>8.3}"', 'r"a"', 'b"b"']) {
      expect(classes(adjacent, string), string).toEqual(['string'])
    }
    expect(classes(adjacent, '; let r =')).toEqual([undefined, 'keyword', undefined, 'operator'])
  })

  it('keeps chars and lifetimes apart when adjacent on one line', () => {
    const code = "let c = 'a'; fn f<'a,'b>(x: &'a mut Foo<'_>) { let s = ' '; }"
    expect(classes(code, "'a'; fn f<'a,'b>(")).toEqual(['string', undefined, 'keyword', undefined, 'function', 'operator', 'meta', undefined, 'meta', 'operator', undefined])
    expect(classes(code, "&'a mut Foo<'_>")).toEqual(['operator', 'meta', undefined, 'keyword', undefined, 'type', 'operator', 'meta', 'operator'])
    expect(classes(code, "' '")).toEqual(['string'])
  })

  it('nests block comments and keeps quotes inside comments', () => {
    const code = '/* outer /* inner "x" */ still \'comment\' */ let a = 1; // don\'t "open"\n/** doc */ fn f() {}'
    expect(classes(code, '/* outer /* inner "x" */ still \'comment\' */')).toEqual(['comment'])
    expect(classes(code, 'let a = 1;')).toEqual(['keyword', undefined, 'operator', undefined, 'number', undefined])
    expect(classes(code, '// don\'t "open"')).toEqual(['comment'])
    expect(classes(code, '/** doc */')).toEqual(['comment'])
    expect(classes(code, 'fn f()')).toEqual(['keyword', undefined, 'function', undefined])
    expect(classes('/* /* unclosed */ fn x', '/* /* unclosed */ fn x')).toEqual(['comment'])
    expect(classes('let x = "// not /* a comment"; let c = \'/\';', '"// not /* a comment"')).toEqual(['string'])
    const edges = '/**/ let a = 1;\n/*/ still comment */ let b = 2;\n/// ```\n/// let x = "y"; // it\'s\n/// ```\nfn g() {}'
    expect(classes(edges, '/**/ let')).toEqual(['comment', undefined, 'keyword'])
    expect(classes(edges, '/*/ still comment */ let')).toEqual(['comment', undefined, 'keyword'])
    expect(classes(edges, '/// let x = "y"; // it\'s')).toEqual(['comment'])
    expect(classes(edges, 'fn g')).toEqual(['keyword', undefined, 'function'])
  })

  it('marks a leading shebang as meta but not an inner attribute', () => {
    const code = '#!/usr/bin/env -S cargo +nightly -Zscript\n#![allow(unused)]\nfn main() {}'
    expect(classes(code, '#!/usr/bin/env -S cargo +nightly -Zscript')).toEqual(['meta'])
    expect(classes(code, '#![allow(')).toEqual(['attr', undefined])
    expect(classes('#![no_std]', '#![no_std')).toEqual(['attr'])
  })

  it('classifies macros, attributes, and macro variables', () => {
    const code = 'macro_rules! square { ($x:expr) => { $x * $x }; }\nlet v = vec![1, 2];\nassert_eq!(a, b);\n#[cfg(all(test, feature = "x"))]\nif a != b {}'
    expect(classes(code, 'macro_rules!')).toEqual(['function'])
    expect(classes(code, '$x:expr')).toEqual(['variable', undefined])
    expect(classes(code, 'vec![')).toEqual(['function', undefined])
    expect(classes(code, 'assert_eq!')).toEqual(['function'])
    expect(classes(code, '#[cfg(all(')).toEqual(['attr', undefined, 'function', undefined])
    expect(classes(code, '"x"')).toEqual(['string'])
    expect(classes(code, 'a != b')).toEqual([undefined, 'operator', undefined])
  })

  it('supports numeric forms without swallowing ranges or tuple access', () => {
    for (const number of ['1_000u64', '0xff_u8', '0o77', '0b1010', '1.5e-3f32', '2.0_f64', '1e10', '42usize', '1.']) {
      expect(classes(`let n = ${number};`, number), number).toEqual(['number'])
    }
    expect(classes('let r = 0..=10;', '0..=10')).toEqual(['number', 'operator', 'number'])
    expect(classes('let x = t.0.1 + y.0;', 't.0.1 + y.0')).toEqual([undefined, 'operator', undefined])
    expect(classes('let x = foo1 + 1.max(2);', 'foo1')).toEqual([undefined])
    expect(classes('let x = 1.max(2);', '1.max')).toEqual(['number', undefined, 'function'])
  })

  it('classifies keywords, types, literals, and paths', () => {
    const code = 'pub(crate) unsafe trait Shape where Self: Sized { type Item; }\nunion IntOrFloat { i: u32, f: f32 }\nlet union = true;\nlet o: Option<i128> = None;\nconst MAX_SIZE: usize = std::mem::size_of::<u8>();\nlet c = move || x?;'
    expect(classes(code, 'pub(crate) unsafe trait Shape where Self')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'type', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'type Item')).toEqual(['keyword', undefined, 'type'])
    expect(classes(code, 'union IntOrFloat')).toEqual(['keyword', undefined, 'type'])
    expect(classes(code, 'let union = true')).toEqual(['keyword', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, 'Option<i128> = None')).toEqual(['type', 'operator', 'type', 'operator', undefined, 'operator', undefined, 'type'])
    expect(classes(code, 'MAX_SIZE: usize')).toEqual([undefined, 'type'])
    expect(classes(code, 'std::mem::size_of::<u8>()')).toEqual([undefined, 'operator', undefined, 'operator', 'function', 'operator', 'operator', 'type', 'operator', undefined])
    expect(classes('struct S { r#type: u8 }', 'r#type: u8')).toEqual([undefined, 'type'])
    expect(classes(code, 'move || x?')).toEqual(['keyword', undefined, 'operator', undefined, 'operator'])
  })

  it('registers only the requested aliases', () => {
    expect(highlighter.normalizeLanguage('rust')).toBe('rust')
    expect(highlighter.normalizeLanguage('rs')).toBe('rust')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('rust')).toBe('plaintext')
  })
})
