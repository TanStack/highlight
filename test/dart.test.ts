import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { dart } from '../src/languages/dart'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [dart] })
const _ = undefined
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'dart')

describe('Dart documentation syntax', () => {
  it('highlights a realistic Flutter widget', () => {
    const code = `import 'package:flutter/material.dart';

/// A counter page. Don't forget the "key".
@immutable
class CounterPage extends StatefulWidget {
  const CounterPage({super.key, required this.title});

  final String title;

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;
  final Map<String, List<int>> cache = {'k': [1_000, 0xFF]};
  String? name;

  void _increment() => setState(() => _count++);

  Stream<int> ticks() async* {
    for (var i = 0; i < 10; i++) {
      yield* Stream.value(i);
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = 'Hello $name, \${cache['k']?.first ?? 0}';
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Text(label, style: Theme.of(context).textTheme.headlineMedium),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
`
    expect(classes(code, "'package:flutter/material.dart'")).toEqual(['string'])
    expect(classes(code, '/// A counter page.')).toEqual(['comment'])
    expect(classes(code, '@immutable')).toEqual(['attr'])
    expect(classes(code, 'CounterPage extends')).toEqual(['type', _, 'keyword'])
    expect(classes(code, 'super.key')).toEqual(['keyword', _, 'property'])
    expect(classes(code, 'required this')).toEqual(['keyword', _, 'keyword'])
    expect(classes(code, 'createState()')).toEqual(['function', _])
    expect(classes(code, '_CounterPageState extends')).toEqual(['type', _, 'keyword'])
    expect(classes(code, 'Map<String, List<int>>')).toEqual(['type', 'operator', 'type', _, 'type', 'operator', 'type', 'operator'])
    expect(classes(code, '1_000, 0xFF')).toEqual(['number', _, 'number'])
    expect(classes(code, 'String? name')).toEqual(['type', 'operator', _])
    expect(classes(code, 'async*')).toEqual(['keyword'])
    expect(classes(code, 'yield* Stream.value')).toEqual(['keyword', _, 'type', _, 'function'])
    expect(classes(code, "'Hello $name, ${cache['k']?.first ?? 0}'")).toEqual(['string'])
    expect(classes(code, 'appBar: AppBar(title: Text(widget.title))')).toEqual([
      'property', 'operator', _, 'type', _, 'property', 'operator', _, 'type', _, 'property', _,
    ])
    expect(classes(code, 'const EdgeInsets.all(8)')).toEqual(['keyword', _, 'type', _, 'function', _, 'number', _])
    expect(classes(code, 'Theme.of(context).textTheme')).toEqual(['type', _, 'function', _, 'property'])
  })

  it('finds the end of interpolated strings with nested quotes and braces', () => {
    const nested = `'\${map['key']} and \${items.map((e) => "<$e>").join()} it\\'s {}'`
    const deep = `"\${'a \${"b \${'c'}"}'} // not a comment"`
    const code = `final a = ${nested}; // tail\nfinal b = ${deep};\nfinal c = "\${{'k': 1}['k']}";`
    expect(classes(code, nested)).toEqual(['string'])
    expect(classes(code, '// tail')).toEqual(['comment'])
    expect(classes(code, deep)).toEqual(['string'])
    expect(classes(code, `"\${{'k': 1}['k']}"`)).toEqual(['string'])
    expect(classes(code, 'final c')).toEqual(['keyword', _])
  })

  it('handles triple-quoted, raw, and adjacent strings', () => {
    const triple = `'''\nIt's a "test" with \${user['name']}\nand ''\n'''`
    const doubleTriple = `"""\nShe said "hi" \${"x"}\n"""`
    const raw = `r'C:\\path$notInterp'`
    const rawDouble = `r"C:\\dir\\"`
    const rawTriple = `r'''$a \${'''`
    const code = `var t = ${triple};\nvar u = ${doubleTriple};\nvar p = ${raw}; var q = ${rawDouble}; var s = ${rawTriple};\nvar j = 'a' "b" 'c';\nvar bar = 1;`
    expect(classes(code, triple)).toEqual(['string'])
    expect(classes(code, doubleTriple)).toEqual(['string'])
    expect(classes(code, raw)).toEqual(['string'])
    expect(classes(code, rawDouble)).toEqual(['string'])
    expect(classes(code, `${rawTriple};`)).toEqual(['string', _])
    expect(classes(code, `'a' "b" 'c'`)).toEqual(['string', _, 'string', _, 'string'])
    expect(classes(code, 'var bar')).toEqual(['keyword', _])
  })

  it('resets raw-ness and escapes around nested and dollar-heavy strings', () => {
    const code = `var a = "\${r'raw\\'} \\\${x} \${'}'}" + '\${names[r]}' + 'cost: \\$\${price}' + '$';\nvar j = r'\\'; var k = 1;\nfor (final r in ['a']) {}`
    expect(classes(code, `"\${r'raw\\'} \\\${x} \${'}'}"`)).toEqual(['string'])
    expect(classes(code, `'\${names[r]}' + 'cost: \\$\${price}' + '$'`)).toEqual(['string', _, 'operator', _, 'string', _, 'operator', _, 'string'])
    expect(classes(code, `r'\\'; var k`)).toEqual(['string', _, 'keyword', _])
    expect(classes(code, "r in ['a']")).toEqual([_, 'keyword', _, 'string', _])
  })

  it('keeps unterminated single-line strings to their line', () => {
    const code = "var s = 'oops\nvar n = 1;"
    expect(classes(code, "'oops")).toEqual(['string'])
    expect(classes(code, 'var n')).toEqual(['keyword', _])
  })

  it('nests block comments and isolates delimiters inside comments', () => {
    const block = `/* outer /* inner "x" */ still 'comment' */`
    const code = `${block} int after;\n// don't "stop"\nvar x = 1; /// doc's\nvar y = '/* not a comment */ // nor this';`
    expect(classes(code, block)).toEqual(['comment'])
    expect(classes(code, 'int after')).toEqual(['type', _])
    expect(classes(code, `// don't "stop"`)).toEqual(['comment'])
    expect(classes(code, 'var x')).toEqual(['keyword', _])
    expect(classes(code, "/// doc's")).toEqual(['comment'])
    expect(classes(code, "'/* not a comment */ // nor this'")).toEqual(['string'])
  })

  it('classifies annotations, keywords, literals, and types', () => {
    const code = `@Deprecated('use x')\n@pragma('vm:entry-point')\nlate final bool? ok = true;\nvoid Function(int) cb;\nNever fail() => throw null;\nextension StringX on String {}\nenum color { red }\nfinal ok = x is! Foo;\nconst MAX_SIZE = 1;`
    expect(classes(code, "@Deprecated('use x')")).toEqual(['attr', _, 'string', _])
    expect(classes(code, "@pragma('vm:entry-point')")).toEqual(['attr', _, 'string', _])
    expect(classes(code, 'late final bool? ok = true')).toEqual(['keyword', _, 'keyword', _, 'type', 'operator', _, 'operator', _, 'literal'])
    expect(classes(code, 'void Function(int)')).toEqual(['type', _, 'type', _, 'type', _])
    expect(classes(code, 'Never fail() => throw null')).toEqual(['type', _, 'function', _, 'operator', _, 'keyword', _, 'literal'])
    expect(classes(code, 'extension StringX on String')).toEqual(['keyword', _, 'type', _, 'keyword', _, 'type'])
    expect(classes(code, 'enum color')).toEqual(['keyword', _, 'type'])
    expect(classes(code, 'is! Foo')).toEqual(['keyword', 'operator', _, 'type'])
    expect(classes(code, 'MAX_SIZE')).toEqual([_])
  })

  it('separates numbers from cascades, spreads, and member access', () => {
    for (const number of ['1_000', '1__000', '0xFF', '0xFF_FF', '1.5e3', '1e-3', '.5', '42']) {
      expect(classes(`var n = ${number};`, number), number).toEqual(['number'])
    }
    const code = 'final l = [...items, ...?other]..add(1)..length = 2;\nobj?..foo();\nfinal s = 1.toString() + v1.2.3 + 1.2.3;'
    expect(classes(code, '...items')).toEqual(['operator', _])
    expect(classes(code, '...?other')).toEqual(['operator', _])
    expect(classes(code, '..add(1)')).toEqual(['operator', 'function', _, 'number', _])
    expect(classes(code, '..length')).toEqual(['operator', 'property'])
    expect(classes(code, '?..foo')).toEqual(['operator', 'function'])
    expect(classes(code, '1.toString')).toEqual(['number', _, 'function'])
    expect(classes(code, '+ 1.2.3')).toEqual(['operator', _])
  })

  it('labels named arguments and records but not ternaries', () => {
    const code = "foo(a ? b : c, flag ? x: y);\nfinal r = (name: 'x', age: 3);\nfinal m = {'k': v};\nswitch (shape) { Circle(:final radius) when radius > 0 => radius, _ => 0 }\nx ??= y ?? z ~/ 2;"
    expect(classes(code, 'a ? b : c')).toEqual([_, 'operator', _, 'operator', _])
    expect(classes(code, 'x: y')).toEqual([_, 'operator', _])
    expect(classes(code, "(name: 'x', age: 3)")).toEqual([_, 'property', 'operator', _, 'string', _, 'property', 'operator', _, 'number', _])
    expect(classes(code, "{'k': v}")).toEqual([_, 'string', 'operator', _])
    expect(classes(code, 'Circle(:final radius) when')).toEqual(['type', _, 'operator', 'keyword', _, 'keyword'])
    expect(classes(code, 'x ??= y ?? z ~/ 2')).toEqual([_, 'operator', _, 'operator', _, 'operator', _, 'number'])
  })

  it('colours contextual keywords only where they are used as keywords', () => {
    const code = `import 'a.dart' deferred as a show Foo hide Bar;\npart 'x.g.dart';\nbase mixin M on Object {}\nsealed class Store extends _$Store {}\nextension type Id(int v) {}\nint get value => _v;\nset value(int v) {}\nlate final List<int> xs;\nfinal set = <int>{}, base = 10;\nfor (final part in parts) {}\nif (when == null) show();\nfoo(show: true, on: false);\non<Tap>((e) => e);\nswitch (x) {\n  default:\n}`
    expect(classes(code, 'deferred as a show Foo hide Bar')).toEqual(['keyword', _, 'keyword', _, 'keyword', _, 'type', _, 'keyword', _, 'type'])
    expect(classes(code, "part 'x.g.dart'")).toEqual(['keyword', _, 'string'])
    expect(classes(code, 'base mixin M on Object')).toEqual(['keyword', _, 'keyword', _, 'type', _, 'keyword', _, 'type'])
    expect(classes(code, 'sealed class Store extends _$Store')).toEqual(['keyword', _, 'keyword', _, 'type', _, 'keyword', _, 'type'])
    expect(classes(code, 'extension type Id(int')).toEqual(['keyword', _, 'type', _, 'type'])
    expect(classes(code, 'int get value')).toEqual(['type', _, 'keyword', _])
    expect(classes(code, 'set value(')).toEqual(['keyword', _, 'function', _])
    expect(classes(code, 'late final')).toEqual(['keyword', _, 'keyword'])
    expect(classes(code, 'set = <int>{}, base =')).toEqual([_, 'operator', _, 'operator', 'type', 'operator', _, 'operator'])
    expect(classes(code, 'final part in')).toEqual(['keyword', _, 'keyword'])
    expect(classes(code, 'when == null) show()')).toEqual([_, 'operator', _, 'literal', _, 'function', _])
    expect(classes(code, 'show: true, on: false')).toEqual(['property', 'operator', _, 'literal', _, 'property', 'operator', _, 'literal'])
    expect(classes(code, 'on<Tap>')).toEqual([_, 'operator', 'type', 'operator'])
    expect(classes(code, 'default:')).toEqual(['keyword', 'operator'])
  })

  it('keeps keywords after member access plain', () => {
    const code = 'value.when(data: (d) => d);\nfinal s = obj.set;'
    expect(classes(code, 'when(data:')).toEqual(['function', _, 'property', 'operator'])
    expect(classes(code, 'obj.set')).toEqual([_, 'property'])
  })

  it('registers only the dart name', () => {
    expect(highlighter.normalizeLanguage('dart')).toBe('dart')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('dart')).toBe('plaintext')
  })
})
