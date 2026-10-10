import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { java } from '../src/languages/java'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [java] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'java')

const showcase = `package com.example.cache;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import static java.util.Objects.requireNonNull;

/**
 * A tiny TTL cache. Use {@code get("key")} to read; don't share across tenants.
 */
public final class TtlCache<K, V> implements AutoCloseable {
    private static final long DEFAULT_TTL_MS = 60_000L;
    private final Map<K, Entry<V>> entries = new ConcurrentHashMap<>();
    private final Duration ttl;

    public sealed interface Result<V> permits Hit, Miss {}
    public record Hit<V>(V value, long age) implements Result<V> {}
    public record Miss<V>() implements Result<V> {}

    public TtlCache(Duration ttl) {
        this.ttl = requireNonNull(ttl, "ttl must not be null");
    }

    @Override
    @SuppressWarnings("unchecked")
    public void close() {
        entries.clear(); // drop everything
    }

    public Result<V> get(K key) {
        var entry = entries.get(key);
        if (entry == null || entry.isExpired(ttl)) return new Miss<>();
        return new Hit<>(entry.value(), System.nanoTime() - entry.createdAt());
    }

    public String describe(Result<V> result) {
        return switch (result) {
            case Hit<V> hit when hit.age() > 0x1F -> "hit after " + hit.age() + "ns";
            case Miss<V> miss -> {
                String help = """
                    Nothing cached for "%s".
                    See https://example.com/docs // not a comment
                    """;
                yield help.formatted(miss);
            }
        };
    }

    public void dump() {
        entries.keySet().stream().map(String::valueOf).forEach(System.out::println);
    }
}
`

describe('Java documentation syntax', () => {
  it('highlights a realistic class', () => {
    expect(classes(showcase, 'package')).toEqual(['keyword'])
    expect(classes(showcase, 'java.time.Duration')).toEqual([undefined])
    expect(classes(showcase, '/**')).toEqual(['comment'])
    expect(classes(showcase, '{@code get("key")}')).toEqual(['comment'])
    expect(classes(showcase, 'TtlCache')).toEqual(['type'])
    expect(classes(showcase, 'implements')).toEqual(['keyword'])
    expect(classes(showcase, 'DEFAULT_TTL_MS')).toEqual([undefined])
    expect(classes(showcase, '60_000L')).toEqual(['number'])
    expect(classes(showcase, 'sealed')).toEqual(['keyword'])
    expect(classes(showcase, 'permits')).toEqual(['keyword'])
    expect(classes(showcase, 'record')).toEqual(['keyword'])
    expect(classes(showcase, 'this.ttl')).toEqual(['keyword', undefined, 'property'])
    expect(classes(showcase, 'requireNonNull(ttl')).toEqual(['function', undefined])
    expect(classes(showcase, '"ttl must not be null"')).toEqual(['string'])
    expect(classes(showcase, '@Override')).toEqual(['attr'])
    expect(classes(showcase, '@SuppressWarnings("unchecked")')).toEqual(['attr', undefined, 'string', undefined])
    expect(classes(showcase, 'void')).toEqual(['type'])
    expect(classes(showcase, '// drop everything')).toEqual(['comment'])
    expect(classes(showcase, 'var entry')).toEqual(['keyword', undefined])
    expect(classes(showcase, 'null ||')).toEqual(['literal', undefined, 'operator'])
    expect(classes(showcase, 'hit when hit')).toEqual([undefined, 'keyword', undefined])
    expect(classes(showcase, '0x1F')).toEqual(['number'])
    expect(classes(showcase, '-> "hit')).toEqual(['operator', undefined, 'string'])
    expect(classes(showcase, '"""\n                    Nothing')).toEqual(['string'])
    expect(classes(showcase, 'yield')).toEqual(['keyword'])
    expect(classes(showcase, 'String::valueOf')).toEqual(['type', 'operator', 'function'])
    expect(classes(showcase, 'System.out::println')).toEqual(['type', undefined, 'property', 'operator', 'function'])
  })

  it('keeps text blocks whole, including quotes, escapes, and comment markers', () => {
    const block = '"""\n  {"a": "b", "c": ""} // still text\n  \\""" /* also text */\n  """'
    const code = `String json = ${block};\nint after = 1;`
    expect(classes(code, block)).toEqual(['string'])
    expect(classes(code, 'int after')).toEqual(['type', undefined])
    expect(classes(code, '1;')).toEqual(['number', undefined])
    const empty = 'String s = """\n""";'
    expect(classes(empty, '"""\n"""')).toEqual(['string'])
  })

  it('handles ordinary strings and char literals', () => {
    const code = 'String url = "http://x.com/*y*/";\nString q = "say \\"hi\\" // no";\nchar a = \'\\\'\', b = \'"\', c = \'A\', d = \'\\u0041\';\nString e = "it\'s";'
    expect(classes(code, '"http://x.com/*y*/"')).toEqual(['string'])
    expect(classes(code, '"say \\"hi\\" // no"')).toEqual(['string'])
    expect(classes(code, "'\\''")).toEqual(['string'])
    expect(classes(code, '\'"\'')).toEqual(['string'])
    expect(classes(code, "'A'")).toEqual(['string'])
    expect(classes(code, "'\\u0041'")).toEqual(['string'])
    expect(classes(code, '"it\'s"')).toEqual(['string'])
  })

  it('isolates line, block, and Javadoc comments', () => {
    const code = '// don\'t "quote"\nint x; /* it\'s "fine" */ int y;\n/** @param z the "z" */\nvoid f(int z) {}'
    expect(classes(code, '// don\'t "quote"')).toEqual(['comment'])
    expect(classes(code, '/* it\'s "fine" */')).toEqual(['comment'])
    expect(classes(code, 'int y')).toEqual(['type', undefined])
    expect(classes(code, '/** @param z the "z" */')).toEqual(['comment'])
    expect(classes(code, 'f(')).toEqual(['function', undefined])
  })

  it('stops unterminated strings at end of line and runs text blocks and comments to EOF', () => {
    const code = 'String s = "open\nint next = 2;'
    expect(classes(code, '"open')).toEqual(['string'])
    expect(classes(code, 'int next')).toEqual(['type', undefined])
    const slash = 'String s = "abc\\\nint y = 1;'
    expect(classes(slash, '"abc\\')).toEqual(['string'])
    expect(classes(slash, 'int y')).toEqual(['type', undefined])
    expect(classes('int a; /* open\n "x" int b;', '/* open\n "x" int b;')).toEqual(['comment'])
    expect(classes('String t = """\n  open \\', '"""\n  open \\')).toEqual(['string'])
    expect(classes('String s = "x\\', '"x\\')).toEqual(['string'])
  })

  it('distinguishes annotations from @interface declarations', () => {
    const code = '@interface Marker { String value() default ""; }\n@java.lang.Deprecated(since = "9")\n@Marker class Foo {}'
    expect(classes(code, '@interface')).toEqual(['keyword'])
    expect(classes(code, 'Marker {')).toEqual(['type', undefined])
    expect(classes(code, 'default')).toEqual(['keyword'])
    expect(classes(code, '@java.lang.Deprecated')).toEqual(['attr'])
    expect(classes(code, '@Marker')).toEqual(['attr'])
  })

  it('recognizes Java numeric literal forms', () => {
    for (const number of ['1_000_000', '0xFF_FFL', '0b1010', '017', '1.5f', '1e-3d', '100L', '0x1.8p1', '.5', '3.', '1E10F', '0B1_0']) {
      const code = `double v = ${number};`
      expect(classes(code, number), number).toEqual(['number'])
    }
    const code = 'int x1 = a.b + v1.2.3;'
    expect(classes(code, 'x1')).toEqual([undefined])
    expect(classes(code, '1.2.3')).toEqual([undefined])
  })

  it('types PascalCase names and primitives but not constants', () => {
    const code = 'List<Map<String, Integer>> rows; boolean ok; T item; MAX_SIZE; Foo.class; int[] xs;'
    expect(classes(code, 'List<Map<String, Integer>>')).toEqual(['type', 'operator', 'type', 'operator', 'type', undefined, 'type', 'operator'])
    expect(classes(code, 'boolean')).toEqual(['type'])
    expect(classes(code, 'T item')).toEqual([undefined])
    expect(classes(code, 'MAX_SIZE')).toEqual([undefined])
    expect(classes(code, 'Foo.class')).toEqual(['type', undefined, 'keyword'])
    const varargs = 'static void main(String... args) { int.class; }'
    expect(classes(varargs, 'String... args)')).toEqual(['type', undefined])
    expect(classes(varargs, 'int.class')).toEqual(['type', undefined, 'keyword'])
  })

  it('treats modern contextual keywords only in keyword position', () => {
    const code = 'non-sealed class A {}\nrecord Point(int x, int y) {}\nvar list = record.items();\nint var = 1;\nObject o = obj instanceof String s ? s : null;\nRunnable r = () -> super.run();\nint when = 1;\nfoo(when);\nthis.when = when.toString();'
    expect(classes(code, 'non-sealed')).toEqual(['keyword'])
    expect(classes(code, 'record Point')).toEqual(['keyword', undefined, 'type'])
    expect(classes(code, 'var list')).toEqual(['keyword', undefined])
    expect(classes(code, 'record.items')).toEqual([undefined, 'function'])
    expect(classes(code, 'var = 1')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'instanceof String s')).toEqual(['keyword', undefined, 'type', undefined])
    expect(classes(code, '() -> super')).toEqual([undefined, 'operator', undefined, 'keyword'])
    expect(classes(code, 'int when = 1')).toEqual(['type', undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'foo(when)')).toEqual(['function', undefined])
    expect(classes(code, 'this.when = when.toString()')).toEqual(['keyword', undefined, 'property', undefined, 'operator', undefined, 'function', undefined])
  })

  it('handles module declarations and import paths', () => {
    const code = 'module com.example.app {\n    requires transitive java.base;\n    exports com.example.api;\n}\nimport java.util.*;\n// import not.a.Path;\nString s = "import a.b";'
    expect(classes(code, 'module')).toEqual(['keyword'])
    expect(classes(code, 'requires transitive')).toEqual(['keyword'])
    expect(classes(code, 'exports')).toEqual(['keyword'])
    expect(classes(code, 'import java.util.*;')).toEqual(['keyword', undefined])
    expect(classes(code, '// import not.a.Path;')).toEqual(['comment'])
    expect(classes(code, '"import a.b"')).toEqual(['string'])
  })

  it('registers no aliases and falls back to plaintext when absent', () => {
    expect(highlighter.normalizeLanguage('java')).toBe('java')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('java')).toBe('plaintext')
  })
})
