import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { csharp } from '../src/languages/csharp'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [csharp] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'csharp')

const showcase = `#nullable enable
using System.Text.Json;
namespace Demo.Api;

/// <summary>Stores users. Don't "panic".</summary>
[ApiController]
[Route("api/[controller]")]
public sealed partial class UsersController(IUserStore store) : ControllerBase
{
    #region Queries
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto?>> Get(int id, CancellationToken ct = default)
    {
        var user = await store.FindAsync(id, ct)!;
        if (user is not { Active: true }) return NotFound($"No user {id}");
        var path = @"C:\\data\\users\\" + user.Name;
        var json = $$"""{"id": {{user.Id}}, "tags": [1, 2]}""";
        var label = $"{(user.Admin ? "Admin" : "User")}: {user.Balance:N2} {{literal}}";
        long big = 1_000_000L;
        user.Nickname ??= user?.Name ?? "anon";
        Console.WriteLine("http://example.com // not a comment");
        return Ok(user);
    }
    #endregion

    public required string Name { get; init; }
    public record Person(string First, int Age);

    public IEnumerable<string> Adults(IEnumerable<Person> people) =>
        from p in people
        where p.Age >= 18
        orderby p.First descending
        select p.First;

    T Parse<T>(string s) where T : notnull => JsonSerializer.Deserialize<T>(s)!;
    (int a, string b) Pair() => (1, "x");
    Dictionary<string, List<int>> map = new();
    int[] values = [1, 2, 3];
}
`

describe('C# documentation syntax', () => {
  it('highlights a realistic controller sample', () => {
    const code = showcase
    expect(classes(code, '#nullable enable')).toEqual(['meta'])
    expect(classes(code, 'System.Text.Json')).toEqual(['type'])
    expect(classes(code, '/// <summary>')).toEqual(['comment'])
    expect(classes(code, 'ApiController')).toEqual(['attr'])
    expect(classes(code, 'Route')).toEqual(['attr'])
    expect(classes(code, '"api/[controller]"')).toEqual(['string'])
    expect(classes(code, 'partial class UsersController')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, '#region Queries')).toEqual(['meta'])
    expect(classes(code, 'HttpGet')).toEqual(['attr'])
    expect(classes(code, 'Task<ActionResult')).toEqual(['type', 'operator', 'type'])
    expect(classes(code, 'Get(int')).toEqual(['function', undefined, 'type'])
    expect(classes(code, 'await store.FindAsync(')).toEqual(['keyword', undefined, 'function', undefined])
    expect(classes(code, 'user is not { Active: true }')).toEqual([undefined, 'keyword', undefined, 'keyword', undefined, 'property', 'operator', undefined, 'literal', undefined])
    expect(classes(code, '@"C:\\data\\users\\"')).toEqual(['string'])
    expect(classes(code, 'user.Name;')).toEqual([undefined, 'property', undefined])
    expect(classes(code, '$$"""{"id": {{user.Id}}, "tags": [1, 2]}"""')).toEqual(['string'])
    expect(classes(code, '$"{(user.Admin ? "Admin" : "User")}: {user.Balance:N2} {{literal}}"')).toEqual(['string'])
    expect(classes(code, '1_000_000L')).toEqual(['number'])
    expect(classes(code, '??= user?.Name ??')).toEqual(['operator', undefined, 'operator', 'property', undefined, 'operator'])
    expect(classes(code, 'Console.WriteLine(')).toEqual(['type', undefined, 'function', undefined])
    expect(classes(code, '"http://example.com // not a comment"')).toEqual(['string'])
    expect(classes(code, 'Name { get; init; }')).toEqual(['property', undefined, 'keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'record Person(string First')).toEqual(['keyword', undefined, 'type', undefined, 'type', undefined, 'type'])
    expect(classes(code, 'from p in people')).toEqual(['keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'orderby p.First descending')).toEqual(['keyword', undefined, 'property', undefined, 'keyword'])
    expect(classes(code, 'select p.First')).toEqual(['keyword', undefined, 'property'])
    expect(classes(code, 'Parse<T>(')).toEqual(['function', 'operator', undefined, 'operator', undefined])
    expect(classes(code, 'where T : notnull =>')).toEqual(['keyword', undefined, 'operator', undefined, 'keyword', undefined, 'operator'])
    expect(classes(code, 'Deserialize<T>(s)!')).toEqual(['function', 'operator', undefined, 'operator', undefined, 'operator'])
    expect(classes(code, 'Dictionary<string, List<int>>')).toEqual(['type', 'operator', 'type', undefined, 'type', 'operator', 'type', 'operator'])
    expect(classes(code, '[1, 2, 3]')).toEqual([undefined, 'number', undefined, 'number', undefined, 'number', undefined])
  })

  it('scans regular, verbatim and character literals', () => {
    const code = `var a = "a \\" b // c";\nvar p = @"C:\\path\\" + @"say ""hi""\nnext line";\nchar q = '\\''; char u = '\\u0041'; char d = '"';\nvar e = "";`
    expect(classes(code, '"a \\" b // c"')).toEqual(['string'])
    expect(classes(code, '@"C:\\path\\"')).toEqual(['string'])
    expect(classes(code, '+ @"say')).toEqual(['operator', undefined, 'string'])
    expect(classes(code, '@"say ""hi""\nnext line"')).toEqual(['string'])
    expect(classes(code, "'\\''")).toEqual(['string'])
    expect(classes(code, "'\\u0041'")).toEqual(['string'])
    expect(classes(code, `'"'`)).toEqual(['string'])
    expect(classes(code, '""')).toEqual(['string'])
  })

  it('finds the end of interpolated strings with nested quotes and braces', () => {
    for (const string of [
      '$"Hello {name}"',
      '$"{dict["key"]}"',
      '$"{(ok ? "yes" : "no")}"',
      '$"{value:N2} {{literal}} }}"',
      `$"{'}'} {c}"`,
      '$"{$"inner {x}"} and {y}"',
      '$@"{path}\\{file}"',
      '@$"C:\\{dir}\\"',
      '$@"say ""{x}"""',
    ]) {
      const code = `var s = ${string}; var after = "x";`
      expect(classes(code, string), string).toEqual(['string'])
      expect(classes(code, 'var after'), string).toEqual(['keyword', undefined])
    }
  })

  it('stops unterminated single-line strings at the line end', () => {
    const code = 'var a = "open\nvar b = $"{open\nvar c = 1;'
    expect(classes(code, 'var b')).toEqual(['keyword', undefined])
    expect(classes(code, 'var c = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('matches raw string delimiters by quote count', () => {
    const multi = '"""\n    He said "hi" // and ""quoted""\n    """'
    for (const string of [multi, '""""a """ b""""', '$"""{x} "q" """', '$$"""{{x}} {not a hole}"""']) {
      const code = `var s = ${string};\nvar after = 1;`
      expect(classes(code, string), string).toEqual(['string'])
      expect(classes(code, 'var after'), string).toEqual(['keyword', undefined])
    }
  })

  it('keeps comments and preprocessor lines apart from strings', () => {
    const code = `/* block "quote' */ var j = 1;\n// it's "fine"\n/// <param name="x">doc</param>\n#if DEBUG\n  Log("#if not meta");\n#endif\n#pragma warning disable CS0168\nvar url = "http://x"; // tail`
    expect(classes(code, `/* block "quote' */`)).toEqual(['comment'])
    expect(classes(code, 'var j')).toEqual(['keyword', undefined])
    expect(classes(code, `// it's "fine"`)).toEqual(['comment'])
    expect(classes(code, '/// <param name="x">doc</param>')).toEqual(['comment'])
    expect(classes(code, '#if DEBUG')).toEqual(['meta'])
    expect(classes(code, '"#if not meta"')).toEqual(['string'])
    expect(classes(code, '#endif')).toEqual(['meta'])
    expect(classes(code, '#pragma warning disable CS0168')).toEqual(['meta'])
    expect(classes(code, '"http://x"')).toEqual(['string'])
    expect(classes(code, '// tail')).toEqual(['comment'])
  })

  it('detects line-leading and parameter attributes', () => {
    const code = `[assembly: InternalsVisibleTo("X")]\n[Required, MaxLength(50)]\nitems[0] = Lookup[Key];\nint[] xs =\n[\n    Foo,\n];\nvar ys = [Bar, Baz];`
    expect(classes(code, 'assembly: InternalsVisibleTo')).toEqual([undefined, 'operator', undefined, 'attr'])
    expect(classes(code, 'Required')).toEqual(['attr'])
    expect(classes(code, 'MaxLength')).toEqual(['function'])
    expect(classes(code, 'items[0]')).toEqual([undefined, 'number', undefined])
    expect(classes(code, 'Lookup[Key]')).toEqual(['type', undefined, 'type', undefined])
    expect(classes(code, 'Foo')).toEqual(['type'])
    expect(classes(code, '[Bar')).toEqual([undefined, 'type'])
  })

  it('separates keywords, contextual words, literals and types', () => {
    const code = `var record = 5; var file = record + 1; var select = from;\nfile sealed class Hidden { }\npublic int Count { get; set; }\nvoid M() { this.x = base.y; nameof(x); }\nbool ok = true || false; object? o = null;\nnint n; nuint m; dynamic d; MAX_SIZE = 1;\nif (x is not null and > 0 or < -1) { }\nvar n2 = new Foo { Bar = 1 };`
    expect(classes(code, 'var record = 5')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'var file = record + 1')).toEqual(['keyword', undefined, 'operator', undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'var select = from;')).toEqual(['keyword', undefined, 'operator', undefined])
    expect(classes(code, 'file sealed class Hidden')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'Count { get; set; }')).toEqual(['property', undefined, 'keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'this.x = base.y')).toEqual(['keyword', undefined, 'property', undefined, 'operator', undefined, 'keyword', undefined, 'property'])
    expect(classes(code, 'nameof(')).toEqual(['keyword', undefined])
    expect(classes(code, 'true || false')).toEqual(['literal', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, 'object? o = null')).toEqual(['type', 'operator', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, 'nint n; nuint m; dynamic d;')).toEqual(['type', undefined, 'type', undefined, 'type', undefined])
    expect(classes(code, 'MAX_SIZE')).toEqual([undefined])
    expect(classes(code, 'is not null and > 0 or')).toEqual(['keyword', undefined, 'keyword', undefined, 'literal', undefined, 'keyword', undefined, 'operator', undefined, 'number', undefined, 'keyword'])
    const patterns = 'var r = s switch { Circle { Radius: > 0 } => F(Name: 1), _ => ok ? Yes : No };\nvoid M<TKey>() where TKey : notnull { }'
    expect(classes(patterns, 'Radius: >')).toEqual(['property', 'operator', undefined, 'operator'])
    expect(classes(patterns, 'Name:')).toEqual(['property', 'operator'])
    expect(classes(patterns, 'Yes : No')).toEqual(['type', undefined, 'operator', undefined, 'type'])
    expect(classes(patterns, 'TKey : notnull')).toEqual(['type', undefined, 'operator', undefined, 'keyword'])
    expect(classes(code, 'new Foo { Bar = 1 }')).toEqual(['keyword', undefined, 'type', undefined, 'property', undefined, 'operator', undefined, 'number', undefined])
  })

  it('classifies numbers and operators', () => {
    for (const number of ['1_000', '0xFF', '0x_FF_FF', '0b1010_1010', '1.5f', '1.5m', '100L', '1e-3', '10UL', '.5d', '2.5E+10']) {
      expect(classes(`var n = ${number};`, number), number).toEqual(['number'])
    }
    expect(classes('var v = 1.2.3; var id = item1;', '1.2.3')).toEqual([undefined])
    expect(classes('var v = 1.2.3; var id = item1;', 'item1')).toEqual([undefined])
    const code = 'var s = items[1..^1]; var t = x?[0] ?? y!; p->Next; global::System.Math.Max(a, b); f = x => x;'
    expect(classes(code, '1..^1')).toEqual(['number', 'operator', 'operator', 'number'])
    expect(classes(code, 'x?[0] ?? y!')).toEqual([undefined, 'operator', undefined, 'number', undefined, 'operator', undefined, 'operator'])
    expect(classes(code, 'p->Next')).toEqual([undefined, 'operator', 'type'])
    expect(classes(code, 'global::System.Math.Max(')).toEqual(['keyword', 'operator', 'type', undefined, 'property', undefined, 'function', undefined])
    expect(classes(code, 'x => x')).toEqual([undefined, 'operator', undefined])
    expect(classes('var r = items[start..end];', 'start..end')).toEqual([undefined, 'operator', undefined])
    expect(classes('var p = Get<Dictionary<string, int>>(key);', 'Get<Dictionary')).toEqual(['function', 'operator', 'type'])
  })

  it('keeps review regressions fixed', () => {
    const code = `using static System.Math;\nusing Json = System.Text.Json.JsonSerializer;\napp.MapPost("/u", async ([FromBody] User dto, [FromServices] AppDb db) => 1);\nforeach (var file in files) { if (file is null) return; }\nforeach (var group in groups) { }\npublic readonly record struct Point(int X, int Y);\npublic string FullName => $"{First} {Last}";\nvar k = s switch { Circle => "c", _ => "?" };`
    expect(classes(code, 'static System.Math;')).toEqual(['keyword', undefined, 'type', undefined])
    expect(classes(code, 'Json = System.Text.Json.JsonSerializer;')).toEqual(['type', undefined, 'operator', undefined, 'type', undefined])
    expect(classes(code, '[FromBody] User')).toEqual([undefined, 'attr', undefined, 'type'])
    expect(classes(code, '[FromServices]')).toEqual([undefined, 'attr', undefined])
    expect(classes(code, 'var file in files')).toEqual(['keyword', undefined, 'keyword', undefined])
    expect(classes(code, 'file is null')).toEqual([undefined, 'keyword', undefined, 'literal'])
    expect(classes(code, 'var group in')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes('var @class = 1;', '@class')).toEqual([undefined])
    expect(classes(code, 'record struct Point(')).toEqual(['keyword', undefined, 'keyword', undefined, 'type', undefined])
    expect(classes(code, 'string FullName =>')).toEqual(['type', undefined, 'property', undefined, 'operator'])
    expect(classes(code, 'Circle =>')).toEqual(['type', undefined, 'operator'])
    const strings = `Foo("", "a"); var o = x == "" ? "a" : "b"; var v = "a""b";\nvar u = $"{(c == '"' ? 1 : 2)}"; var w = $"{new { A = 1 }.A} // {"}"}"; var z = 1;\nvar s = @"one\n#if NOT_META\n// not comment\n"; var r = """\n  /* no */ ""two""\n  """; var after = 2;`
    expect(classes(strings, 'Foo("", "a")')).toEqual(['function', undefined, 'string', undefined, 'string', undefined])
    expect(classes(strings, 'x == "" ? "a" : "b"')).toEqual([undefined, 'operator', undefined, 'string', undefined, 'operator', undefined, 'string', undefined, 'operator', undefined, 'string'])
    expect(classes(strings, '"a""b"')).toEqual(['string', 'string'])
    expect(classes(strings, `$"{(c == '"' ? 1 : 2)}"`)).toEqual(['string'])
    expect(classes(strings, '$"{new { A = 1 }.A} // {"}"}"')).toEqual(['string'])
    expect(classes(strings, 'var z = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(strings, '@"one\n#if NOT_META\n// not comment\n"')).toEqual(['string'])
    expect(classes(strings, '"""\n  /* no */ ""two""\n  """')).toEqual(['string'])
    expect(classes(strings, 'var after')).toEqual(['keyword', undefined])
  })

  it('registers aliases', () => {
    for (const name of ['csharp', 'c#', 'cs']) {
      expect(highlighter.normalizeLanguage(name)).toBe('csharp')
    }
    expect(createHighlighter({ languages: [] }).normalizeLanguage('cs')).toBe('plaintext')
  })
})
