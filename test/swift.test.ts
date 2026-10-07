import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { swift } from '../src/languages/swift'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [swift] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'swift')

const showcase = `import SwiftUI

/// Loads items from the API.
/// \`\`\`swift
/// let model = ItemsModel() // it's "easy"
/// \`\`\`
@MainActor
@Observable
final class ItemsModel {
    private(set) var items: [Item] = []
    weak var delegate: Delegate?

    func load<T: Decodable>(_ type: T.Type, from url: URL) async throws -> [T] {
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw APIError.badStatus(code: 0xFF)
        }
        print("Loaded \\(items.count) items, first: \\(items.first?.name ?? "none")")
        return try JSONDecoder().decode([T].self, from: data)
    }
}

struct ContentView: View {
    @State private var count = 0
    @Environment(\\.dismiss) private var dismiss
    @Binding var isOn: Bool

    var body: some View {
        VStack(spacing: 12) {
            Text("Count: \\(count)")
                .font(.title)
            Button("Increment") { count += 1 }
            Toggle("On", isOn: $isOn)
            ForEach(items, id: \\.id) { item in
                Text(item.name)
            }
        }
        .padding()
        .onAppear {
            withAnimation(.spring) { count = 0 }
        }
    }
}

#Preview {
    ContentView(isOn: .constant(true))
}
`

describe('Swift documentation syntax', () => {
  it('highlights a realistic SwiftUI and async/await sample', () => {
    const code = showcase
    expect(classes(code, 'import SwiftUI')).toEqual(['keyword', undefined, 'type'])
    expect(classes(code, '/// Loads items from the API.')).toEqual(['comment'])
    expect(classes(code, '/// let model = ItemsModel() // it\'s "easy"')).toEqual(['comment'])
    expect(classes(code, '@MainActor')).toEqual(['attr'])
    expect(classes(code, 'final class ItemsModel {')).toEqual(['keyword', undefined, 'keyword', undefined, 'type', undefined])
    expect(classes(code, 'private(set) var items: [Item] = []')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'type', undefined, 'operator', undefined])
    expect(classes(code, 'weak var delegate: Delegate?')).toEqual(['keyword', undefined, 'keyword', undefined, 'type', 'operator'])
    expect(classes(code, 'func load<T: Decodable>(_ type: T.Type, from url: URL)')).toEqual([
      'keyword', undefined, 'function', 'operator', undefined, 'type', 'operator', undefined, 'property', undefined, 'type', undefined, 'property', undefined,
    ])
    expect(classes(code, 'async throws -> [T]')).toEqual(['keyword', undefined, 'keyword', undefined, 'operator', undefined])
    expect(classes(code, 'try await URLSession.shared.data(from: url)')).toEqual([
      'keyword', undefined, 'keyword', undefined, 'type', undefined, 'property', undefined, 'function', undefined, 'property', undefined,
    ])
    expect(classes(code, 'as? HTTPURLResponse')).toEqual(['keyword', 'operator', undefined, 'type'])
    expect(classes(code, 'http.statusCode == 200 else')).toEqual([undefined, 'property', undefined, 'operator', undefined, 'number', undefined, 'keyword'])
    expect(classes(code, 'throw APIError.badStatus(code: 0xFF)')).toEqual(['keyword', undefined, 'type', undefined, 'function', undefined, 'property', undefined, 'number', undefined])
    expect(classes(code, '"Loaded \\(items.count) items, first: \\(items.first?.name ?? "none")"')).toEqual(['string'])
    expect(classes(code, '[T].self, from: data')).toEqual([undefined, 'keyword', undefined, 'property', undefined])
    expect(classes(code, 'struct ContentView: View {')).toEqual(['keyword', undefined, 'type', undefined, 'type', undefined])
    expect(classes(code, '@State private var count = 0')).toEqual(['attr', undefined, 'keyword', undefined, 'keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '@Environment(\\.dismiss)')).toEqual(['attr', undefined, 'property', undefined])
    expect(classes(code, 'var body: some View {')).toEqual(['keyword', undefined, 'keyword', undefined, 'type', undefined])
    expect(classes(code, 'VStack(spacing: 12) {')).toEqual(['type', undefined, 'property', undefined, 'number', undefined])
    expect(classes(code, 'Text("Count: \\(count)")')).toEqual(['type', undefined, 'string', undefined])
    expect(classes(code, '.font(.title)')).toEqual([undefined, 'function', undefined, 'property', undefined])
    expect(classes(code, 'count += 1 }')).toEqual([undefined, 'operator', undefined, 'number', undefined])
    expect(classes(code, 'isOn: $isOn)')).toEqual(['property', undefined, 'variable', undefined])
    expect(classes(code, 'id: \\.id) { item in')).toEqual(['property', undefined, 'property', undefined, 'keyword'])
    expect(classes(code, '.padding()')).toEqual([undefined, 'function', undefined])
    expect(classes(code, '.onAppear {')).toEqual([undefined, 'function', undefined])
    expect(classes(code, 'withAnimation(.spring)')).toEqual(['function', undefined, 'property', undefined])
    expect(classes(code, '#Preview {')).toEqual(['meta', undefined])
    expect(classes(code, '.constant(true)')).toEqual([undefined, 'function', undefined, 'literal', undefined])
  })

  it('finds the end of interpolated strings with nested quotes, parens, and closures', () => {
    const code = [
      'let a = "\\(dict["key"] ?? "none")" + tail',
      'let b = "\\(items.map { "<\\($0)>" }.joined(separator: ", "))" + tail',
      'let c = "count: \\(a + (b * 2))" + tail',
      'let d = "say \\"hi\\" // not a comment" + tail',
      'let e = "url: https://example.com/a?b=c" + tail',
      'let f = "" + "x" + tail',
    ].join('\n')
    expect(classes(code, '"\\(dict["key"] ?? "none")" + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '"\\(items.map { "<\\($0)>" }.joined(separator: ", "))" + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '"count: \\(a + (b * 2))" + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '"say \\"hi\\" // not a comment" + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '"url: https://example.com/a?b=c" + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '"" + "x" + tail')).toEqual(['string', undefined, 'operator', undefined, 'string', undefined, 'operator', undefined])
  })

  it('keeps multi-line strings open until the closing delimiter', () => {
    const code = [
      'let text = """',
      '    He said "hi" and "" and \\"""',
      '    \\(dict["key"] ?? "none") // still text',
      '    \\(format(',
      '        value',
      '    ))',
      '    """',
      'let after = 1',
    ].join('\n')
    expect(classes(code, '"""\n    He said')).toEqual(['string'])
    expect(classes(code, '// still text')).toEqual(['string'])
    expect(classes(code, '))\n    """')).toEqual(['string'])
    expect(classes(code, 'let after = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    const nested = 'let a = """\n  \\(f("""\n    \\(g("x\n", (1))) )\n    """))\n  """\nlet b = 2'
    expect(classes(nested, '"""\n  \\(f(')).toEqual(['string'])
    expect(classes(nested, '"""))\n  """')).toEqual(['string'])
    expect(classes(nested, 'let b = 2')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('stops unterminated single-line strings at the line break', () => {
    const code = 'let a = "unterminated\nlet b = 1\nlet c = "x \\(foo("y"\nlet d = 2'
    expect(classes(code, '"unterminated')).toEqual(['string'])
    expect(classes(code, 'let b = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '"x \\(foo("y"')).toEqual(['string'])
    expect(classes(code, 'let d = 2')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('matches raw string hash counts and raw interpolation', () => {
    const code = [
      'let a = #"a "quoted" \\n not an escape"# + tail',
      'let b = ##"has "# inside"## + tail',
      'let c = #"value: \\#(f("x")) literal: \\(x)"# + tail',
      'let d = #"""',
      '    contains """ and "# and \\#(real("y"))',
      '    """# + tail',
      'let e = #"ends with backslash \\"# + tail',
    ].join('\n')
    expect(classes(code, '#"a "quoted" \\n not an escape"# + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '##"has "# inside"## + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '#"value: \\#(f("x")) literal: \\(x)"# + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, 'contains """ and "#')).toEqual(['string'])
    expect(classes(code, '"""# + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '#"ends with backslash \\"# + tail')).toEqual(['string', undefined, 'operator', undefined])
  })

  it('separates regex literals from division', () => {
    const code = [
      'let a = /ab+c/',
      'let b = #/[a-z]+"/"/# + tail',
      'let c = #/',
      '  (?<name> \\w+ ) # "quoted"',
      '/#',
      'let m = line.firstMatch(of: /\\d+/)',
      'func f() -> Regex<Substring> { return /x+/ }',
      'let ratio = total / Double(count)',
      'x /= 2',
      'let half = (a + b) / 2 / 3',
      'let e = items.reduce(1, /) + 2',
      'let g = #/unterminated',
      'let h = 1',
    ].join('\n')
    expect(classes(code, '/ab+c/')).toEqual(['string'])
    expect(classes(code, '#/[a-z]+"/"/# + tail')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes(code, '#/\n  (?<name> \\w+ ) # "quoted"\n/#')).toEqual(['string'])
    expect(classes(code, '(of: /\\d+/)')).toEqual([undefined, 'property', undefined, 'string', undefined])
    expect(classes(code, 'return /x+/ }')).toEqual(['keyword', undefined, 'string', undefined])
    expect(classes(code, 'total / Double(count)')).toEqual([undefined, 'operator', undefined, 'type', undefined])
    expect(classes(code, 'x /= 2')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, '(a + b) / 2 / 3')).toEqual([undefined, 'operator', undefined, 'operator', undefined, 'number', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '(1, /) + 2')).toEqual([undefined, 'number', undefined, 'operator', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '#/unterminated')).toEqual(['string'])
    expect(classes(code, 'let h = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('nests block comments and keeps delimiters inside comments and strings', () => {
    const code = [
      '/* outer /* inner "quote" */ it\'s still comment */ let a = 1',
      '/** Doc with `code` and "quotes" */',
      'let url = "https://example.com/path" // trailing "comment"',
      'let s = "/* not a comment */"',
      '/* unterminated /* nested */',
      'let hidden = 2',
    ].join('\n')
    expect(classes(code, '/* outer /* inner "quote" */ it\'s still comment */ let')).toEqual(['comment', undefined, 'keyword'])
    expect(classes(code, '/** Doc with `code` and "quotes" */')).toEqual(['comment'])
    expect(classes(code, '"https://example.com/path" // trailing "comment"')).toEqual(['string', undefined, 'comment'])
    expect(classes(code, '"/* not a comment */"')).toEqual(['string'])
    expect(classes(code, '/* unterminated /* nested */\nlet hidden = 2')).toEqual(['comment'])
  })

  it('marks attributes, directives, and freestanding macros', () => {
    const code = [
      '#if os(iOS)',
      'let x = 1',
      '#elseif DEBUG',
      '#else',
      '#endif',
      '@available(iOS 17, *)',
      '@resultBuilder struct Builder {}',
      'func run(completion: @escaping () -> Void) {}',
      'if #available(iOS 17, *) { }',
      'let sel = #selector(tap)',
      '@Test func check() { #expect(a == b); let v = try #require(value) }',
    ].join('\n')
    expect(classes(code, '#if os(iOS)')).toEqual(['meta', undefined, 'function', undefined])
    expect(classes(code, '#elseif DEBUG')).toEqual(['meta', undefined])
    expect(classes(code, '#endif')).toEqual(['meta'])
    expect(classes(code, '@available(iOS 17, *)')).toEqual(['attr', undefined, 'number', undefined, 'operator', undefined])
    expect(classes(code, '@resultBuilder struct')).toEqual(['attr', undefined, 'keyword'])
    expect(classes(code, '@escaping () -> Void')).toEqual(['attr', undefined, 'operator', undefined, 'type'])
    expect(classes(code, 'if #available(')).toEqual(['keyword', undefined, 'meta', undefined])
    expect(classes(code, '#selector(tap)')).toEqual(['meta', undefined])
    expect(classes(code, '#expect(a == b)')).toEqual(['meta', undefined, 'operator', undefined])
    expect(classes(code, 'try #require(value)')).toEqual(['keyword', undefined, 'meta', undefined])
  })

  it('keeps contextual keywords plain when they are identifiers or members', () => {
    const code = [
      'let package = Package(name: "Lib", dependencies: [.package(url: "https://x.y/z.git", from: "1.0.0")])',
      'switch style { case .default: break; default: break }',
      'style = .default; door.open; let copy = x.copy()',
      'var set = Set<Int>(); set.insert(1); let open = optional ?? lazy',
      'let `default` = 1; let `self` = 2',
      'for each in items { }',
    ].join('\n')
    expect(classes(code, 'let package = Package(name: "Lib"')).toEqual(['keyword', undefined, 'operator', undefined, 'type', undefined, 'property', undefined, 'string'])
    expect(classes(code, '.package(url:')).toEqual([undefined, 'function', undefined, 'property', undefined])
    expect(classes(code, 'case .default: break; default:')).toEqual(['keyword', undefined, 'property', undefined, 'keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'style = .default; door.open; let copy = x.copy()')).toEqual([
      undefined, 'operator', undefined, 'property', undefined, 'property', undefined, 'keyword', undefined, 'operator', undefined, 'function', undefined,
    ])
    expect(classes(code, 'var set = Set<Int>(); set.insert')).toEqual(['keyword', undefined, 'operator', undefined, 'type', 'operator', 'type', 'operator', undefined, 'function'])
    expect(classes(code, 'let open = optional ?? lazy')).toEqual(['keyword', undefined, 'operator', undefined, 'operator', undefined])
    expect(classes(code, '`default` = 1; let `self` = 2')).toEqual([undefined, 'operator', undefined, 'number', undefined, 'keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'for each in items')).toEqual(['keyword', undefined, 'keyword', undefined])
  })

  it('keeps declaration modifiers, accessors, and self-like words as keywords', () => {
    const code = [
      'open class Base { open override func run() {} }',
      'package func helper() {}',
      'public internal(set) var count = 0; fileprivate(set) var a = 0',
      'var name: String { get set }',
      'var value: Int { get async throws { 0 } }',
      'var score = 0 { willSet { } didSet { } }',
      'func make() -> some View { body }',
      'let shape: any Shape = Circle()',
      'async let task = fetch()',
      'lazy var cache = [String: Int]()',
      'required init?(coder: NSCoder) { super.init(coder: coder) }',
      'let type = Foo.self; let kp = \\.self; let s = Self.init()',
      'actor Counter { nonisolated func id() {} }',
      'indirect enum Tree { case node(Tree) }',
      'handler = { [weak self] value in self?.update(value) }',
    ].join('\n')
    expect(classes(code, 'open class Base')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'open override func run()')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'function', undefined])
    expect(classes(code, 'package func helper')).toEqual(['keyword', undefined, 'keyword', undefined, 'function'])
    expect(classes(code, 'public internal(set) var')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, 'fileprivate(set) var')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, '{ get set }')).toEqual([undefined, 'keyword', undefined, 'keyword', undefined])
    expect(classes(code, '{ get async throws {')).toEqual([undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'willSet { } didSet')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'some View { body }')).toEqual(['keyword', undefined, 'type', undefined])
    expect(classes(code, 'any Shape = Circle()')).toEqual(['keyword', undefined, 'type', undefined, 'operator', undefined, 'type', undefined])
    expect(classes(code, 'async let task')).toEqual(['keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'lazy var cache')).toEqual(['keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'required init?(coder: NSCoder)')).toEqual(['keyword', undefined, 'keyword', 'operator', undefined, 'property', undefined, 'type', undefined])
    expect(classes(code, 'super.init(coder: coder)')).toEqual(['keyword', undefined, 'keyword', undefined, 'property', undefined])
    expect(classes(code, 'Foo.self; let kp = \\.self; let s = Self.init()')).toEqual([
      'type', undefined, 'keyword', undefined, 'keyword', undefined, 'operator', undefined, 'keyword', undefined, 'keyword', undefined, 'operator', undefined, 'keyword', undefined, 'keyword', undefined,
    ])
    expect(classes(code, 'actor Counter { nonisolated func')).toEqual(['keyword', undefined, 'type', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, 'indirect enum Tree')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, '[weak self] value in self?.update(value)')).toEqual([
      undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', 'operator', undefined, 'function', undefined,
    ])
  })

  it('classifies numbers, ranges, tuples, and operators', () => {
    for (const number of ['1_000_000', '0xFF', '0b1010', '0o17', '1.5e-3', '2.5E+10', '0x1.8p3', '0xFFp-2', '0xaBc', '1E3', '3.14', '42']) {
      expect(classes(`let n = ${number}`, number), number).toEqual(['number'])
    }
    const code = 'let r = 0..<10; let c = 1...5; let t = point.0; let v = 1.2.3; let x = a1 ?? b\nlet ok = a !== b && c >= d || !e; let z = x &+ y; let p = q?.name'
    expect(classes(code, '0..<10')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, '1...5')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, 'point.0')).toEqual([undefined])
    expect(classes(code, 'v = 1.2.3')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'a1 ?? b')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'a !== b && c >= d || !e')).toEqual([undefined, 'operator', undefined, 'operator', undefined, 'operator', undefined, 'operator', undefined, 'operator', undefined])
    expect(classes(code, 'x &+ y')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'q?.name')).toEqual([undefined, 'operator', undefined, 'property'])
  })

  it('separates labels, ternaries, closures, and declarations', () => {
    const code = [
      'let sum = cond ? a : b',
      'f(a ? b : c, label: d)',
      'func greet(person name: String, _ count: Int = 1) {}',
      'let names = users.map { user in user.name }.sorted { $0 < $1 }',
      'if list.isEmpty { return }',
      'for item in model.items { }',
      'typealias Handler = (Result<Data, Error>) -> Void',
      'enum API { case v1 }',
      'protocol Shape { associatedtype Value: Numeric }',
      'extension Array where Element: Equatable { }',
      'let café = "naïve"; let ÿ = 1',
      'infix operator <>: AdditionPrecedence',
      'let ids = users.filter { !$0.isEmpty }.sorted(by: <)',
    ].join('\n')
    expect(classes(code, 'cond ? a : b')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'f(a ? b : c, label: d)')).toEqual(['function', undefined, 'operator', undefined, 'property', undefined])
    expect(classes(code, 'greet(person name: String, _ count: Int = 1)')).toEqual([
      'function', undefined, 'property', undefined, 'type', undefined, 'property', undefined, 'type', undefined, 'operator', undefined, 'number', undefined,
    ])
    expect(classes(code, 'users.map { user in user.name }.sorted { $0 < $1 }')).toEqual([
      undefined, 'function', undefined, 'keyword', undefined, 'property', undefined, 'function', undefined, 'variable', undefined, 'operator', undefined, 'variable', undefined,
    ])
    expect(classes(code, 'list.isEmpty { return }')).toEqual([undefined, 'property', undefined, 'keyword', undefined])
    expect(classes(code, 'model.items { }')).toEqual([undefined, 'property', undefined])
    expect(classes(code, 'typealias Handler = (Result<Data, Error>) -> Void')).toEqual([
      'keyword', undefined, 'type', undefined, 'operator', undefined, 'type', 'operator', 'type', undefined, 'type', 'operator', undefined, 'operator', undefined, 'type',
    ])
    expect(classes(code, 'enum API { case v1 }')).toEqual(['keyword', undefined, 'type', undefined, 'keyword', undefined])
    expect(classes(code, 'associatedtype Value: Numeric')).toEqual(['keyword', undefined, 'type', undefined, 'type'])
    expect(classes(code, 'extension Array where Element')).toEqual(['keyword', undefined, 'type', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'let café = "naïve"; let ÿ = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'string', undefined, 'keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'infix operator <>: AdditionPrecedence')).toEqual(['keyword', undefined, 'keyword', undefined, 'operator', undefined, 'type'])
    expect(classes(code, 'users.filter { !$0.isEmpty }.sorted(by: <)')).toEqual([
      undefined, 'function', undefined, 'operator', 'variable', undefined, 'property', undefined, 'function', undefined, 'property', undefined, 'operator', undefined,
    ])
  })

  it('highlights Package.swift manifests', () => {
    const code = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Networking",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "Networking", targets: ["Networking"])],
    dependencies: [
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),
    ],
    targets: [.target(name: "Networking"), .testTarget(name: "NetworkingTests", dependencies: ["Networking"])]
)
`
    expect(classes(code, '// swift-tools-version: 5.9')).toEqual(['comment'])
    expect(classes(code, 'let package = Package(')).toEqual(['keyword', undefined, 'operator', undefined, 'type', undefined])
    expect(classes(code, 'platforms: [.iOS(.v17)')).toEqual(['property', undefined, 'function', undefined, 'property', undefined])
    expect(classes(code, '.package(url: "https://github.com/apple/swift-log.git", from: "1.5.0")')).toEqual([
      undefined, 'function', undefined, 'property', undefined, 'string', undefined, 'property', undefined, 'string', undefined,
    ])
    expect(classes(code, '.testTarget(name:')).toEqual([undefined, 'function', undefined, 'property', undefined])
  })

  it('registers only the swift name', () => {
    expect(highlighter.normalizeLanguage('swift')).toBe('swift')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('swift')).toBe('plaintext')
  })
})
