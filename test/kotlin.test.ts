import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { kotlin } from '../src/languages/kotlin'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [kotlin] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'kotlin')

const showcase = `@file:JvmName("Users")
package com.example.users

import kotlinx.coroutines.flow.Flow

/**
 * Loads users. Nested /* "comments" */ are fine.
 */
@Serializable
data class User(val id: Long, val name: String, val email: String? = null)

sealed interface Result<out T> {
    data class Ok<T>(val value: T) : Result<T>
    data object Missing : Result<Nothing>
}

class UserRepository private constructor(private val api: Api) {
    companion object {
        @JvmStatic fun create(api: Api) = UserRepository(api)
        const val MAX_SIZE = 1_000
    }

    var loaded: Int = 0
        private set

    val isEmpty: Boolean
        get() = loaded == 0

    suspend fun find(id: Long): Result<User> {
        val user = api.fetch(id)?.takeIf { it.id > 0L } ?: return Result.Missing
        loaded++
        println("Loaded \${user.name} (\$id) // cached")
        return Result.Ok(user)
    }
}

fun String.shout() = uppercase() + "!"

fun main() = runBlocking {
    val repo = UserRepository.create(HttpApi())
    when (val result = repo.find(42L)) {
        is Result.Ok -> println(result.value.name.shout())
        Result.Missing -> println("missing")
    }
    for (i in 0..<3) if (i !in setOf(1, 2)) println('#')
}
`

describe('Kotlin documentation syntax', () => {
  it('highlights a realistic showcase sample', () => {
    const code = showcase
    expect(classes(code, '@file:JvmName')).toEqual(['attr'])
    expect(classes(code, '"Users"')).toEqual(['string'])
    expect(classes(code, 'com.example.users')).toEqual([undefined])
    expect(classes(code, '/**')).toEqual(['comment'])
    expect(classes(code, 'are fine.\n */')).toEqual(['comment'])
    expect(classes(code, '@Serializable')).toEqual(['attr'])
    expect(classes(code, 'data class User')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'String? = null')).toEqual(['type', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, 'out T')).toEqual(['keyword', undefined])
    expect(classes(code, 'data object')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'private constructor')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'companion object')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, '@JvmStatic fun create')).toEqual(['attr', undefined, 'keyword', undefined, 'function'])
    expect(classes(code, 'MAX_SIZE = 1_000')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'private set')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'get() =')).toEqual(['keyword', undefined, 'operator'])
    expect(classes(code, 'suspend fun find')).toEqual(['keyword', undefined, 'keyword', undefined, 'function'])
    expect(classes(code, 'api.fetch(id)?.takeIf {')).toEqual([undefined, 'function', undefined, 'operator', 'function', undefined])
    expect(classes(code, '0L } ?: return')).toEqual(['number', undefined, 'operator', undefined, 'keyword'])
    expect(classes(code, 'loaded++')).toEqual([undefined, 'operator'])
    expect(classes(code, '"Loaded ${user.name} ($id) // cached"')).toEqual(['string'])
    expect(classes(code, 'String.shout')).toEqual(['type', undefined, 'function'])
    expect(classes(code, 'runBlocking {')).toEqual(['function', undefined])
    expect(classes(code, 'HttpApi()')).toEqual(['function', undefined])
    expect(classes(code, 'Result.Ok(user)')).toEqual(['type', undefined, 'function', undefined])
    expect(classes(code, 'is Result.Ok ->')).toEqual(['keyword', undefined, 'type', undefined, 'type', undefined, 'operator'])
    expect(classes(code, 'result.value.name')).toEqual([undefined, 'property', undefined, 'property'])
    expect(classes(code, '0..<3')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, '!in')).toEqual(['keyword'])
    expect(classes(code, "'#'")).toEqual(['string'])
  })

  it('finds the end of templates with nested quotes and braces', () => {
    for (const string of [
      '"Hello, $name"',
      '"${user.name}"',
      '"value: ${map["key"]} // not a comment"',
      '"${if (a) "x" else "y"}"',
      '"${list.map { it.name }}"',
      '"${"}"}"',
      '"${listOf("a", "b").joinToString { "[$it]" }}"',
      '"price: \\$5 and \\"quoted\\" /* no */"',
      '"char ${\'"\'} and ${\'\\\'\'}"',
      '"${\'$\'}9.99 ${a}${b} } { cost$"',
    ]) {
      const code = `val text = ${string} + 1 // tail`
      expect(classes(code, string), string).toEqual(['string'])
      expect(classes(code, '1'), string).toEqual(['number'])
      expect(classes(code, '// tail'), string).toEqual(['comment'])
    }
  })

  it('scans raw strings with quotes, backslashes, templates, and trailing quotes', () => {
    const raw = '"""\n  {"name": "${user.name}", "path": "C:\\temp\\"} // "" not a comment\n  ${"\\"\\"\\""} /* nor this */\n"""'
    const trailing = '"""ends with a quote""""'
    const dollar = '$$"""{"$schema": "$${id}"}"""'
    const code = `val json = ${raw}.trimIndent()\nval quoted = ${trailing}\nval schema = ${dollar}\nval done = true`
    expect(classes(code, raw)).toEqual(['string'])
    expect(classes(code, '.trimIndent')).toEqual([undefined, 'function'])
    expect(classes(code, trailing)).toEqual(['string'])
    expect(classes(code, dollar)).toEqual(['string'])
    expect(classes(code, 'true')).toEqual(['literal'])
  })

  it('handles char literals, nested comments, and unterminated strings', () => {
    const code = [
      "val chars = listOf('a', '\\n', '\\'', '\"', '/', '\\u0041')",
      '/* outer /* inner "quote */ it\'s still */ val after = 1',
      '/** KDoc with `code` and "quotes" */',
      '// line comment with "quote and \'char',
      'val broken = "no end',
      'val next = 2',
    ].join('\n')
    for (const char of ["'a'", "'\\n'", "'\\''", "'\"'", "'/'", "'\\u0041'"]) {
      expect(classes(code, char), char).toEqual(['string'])
    }
    expect(classes(code, '/* outer /* inner "quote */ it\'s still */')).toEqual(['comment'])
    expect(classes(code, 'val after = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '/** KDoc with `code` and "quotes" */')).toEqual(['comment'])
    expect(classes(code, '// line comment with "quote and \'char')).toEqual(['comment'])
    expect(classes(code, '"no end')).toEqual(['string'])
    expect(classes(code, 'val next = 2')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('separates annotations from labels and keeps backticked names intact', () => {
    const code = [
      '@get:Rule val rule = TestRule()',
      '@Suppress("UNCHECKED_CAST") class Box',
      'outer@ for (x in xs) {',
      '    xs.forEach { if (it == x) return@forEach else break@outer }',
      '    this@Box.size',
      '}',
      '@Test fun `does a "thing" when null`() { val v = `class` }',
    ].join('\n')
    expect(classes(code, '@get:Rule')).toEqual(['attr'])
    expect(classes(code, '@Suppress')).toEqual(['attr'])
    expect(classes(code, 'outer@ for')).toEqual([undefined, 'keyword'])
    expect(classes(code, 'return@forEach')).toEqual(['keyword', undefined])
    expect(classes(code, 'break@outer')).toEqual(['keyword', undefined])
    expect(classes(code, 'this@Box')).toEqual(['keyword', undefined, 'type'])
    expect(classes(code, '`does a "thing" when null`')).toEqual(['function'])
    expect(classes(code, '`class`')).toEqual([undefined])
  })

  it('treats soft keywords by context', () => {
    const code = [
      'value class Id(val raw: Int)',
      'enum class Color { RED, GREEN }',
      'open annotation class Marker',
      'inline fun <reified T> List<*>.only(vararg items: T) = filterIsInstance<T>()',
      'val data = map.get(0) + value + open',
      'val result = data',
      'val x = y as? String ?: z!!',
      'expect fun platform(): String',
      'var count = 0',
      '    private set',
      '    set(value) { field = value }',
      'val p: Int get() { return 1 }',
      'val s = set',
      'routing { get("/users/{id}") { }; get(path) { }; get { } }',
      'list.set(0, x)',
      '@file:JvmName("X")',
      '@OptIn(ExperimentalFoo::class) fun f(@PathVariable id: Long) = "user@example.com"',
    ].join('\n')
    expect(classes(code, 'private set')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'set(value) {')).toEqual(['keyword', undefined])
    expect(classes(code, 'get() {')).toEqual(['keyword', undefined])
    expect(classes(code, 's = set')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'get("/users/{id}") { }; get(path) { }; get {')).toEqual(['function', undefined, 'string', undefined, 'function', undefined, 'function', undefined])
    expect(classes(code, 'list.set(')).toEqual([undefined, 'function', undefined])
    expect(classes(code, '@file:JvmName("X")')).toEqual(['attr', undefined, 'string', undefined])
    expect(classes(code, '@OptIn(ExperimentalFoo::class)')).toEqual(['attr', undefined, 'type', 'operator', 'keyword', undefined])
    expect(classes(code, '@PathVariable id')).toEqual(['attr', undefined])
    expect(classes(code, '"user@example.com"')).toEqual(['string'])
    expect(classes(code, 'value class')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'enum class Color')).toEqual(['keyword', undefined, 'keyword', undefined, 'type'])
    expect(classes(code, 'open annotation class')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, 'inline fun <reified T>')).toEqual(['keyword', undefined, 'keyword', undefined, 'operator', 'keyword', undefined, 'operator'])
    expect(classes(code, 'only(vararg')).toEqual(['function', undefined, 'keyword'])
    expect(classes(code, 'data = map.get(0) + value + open')).toEqual([undefined, 'operator', undefined, 'function', undefined, 'number', undefined, 'operator', undefined, 'operator', undefined])
    expect(classes(code, 'result = data')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'as? String ?: z!!')).toEqual(['keyword', undefined, 'type', undefined, 'operator', undefined, 'operator'])
    expect(classes(code, 'expect fun platform')).toEqual(['keyword', undefined, 'keyword', undefined, 'function'])
  })

  it('colours trailing-lambda and generic calls but not types before braces', () => {
    const code = [
      'fun <T> identity(x: T): T { return x }',
      'fun <R> run(block: () -> R): R { return block() }',
      'val big = MAX_SIZE {}',
      'setContent { AppTheme { Column { Text("x") } } }',
      'class A : B, Cee {',
      'enum class Color { RED { override fun x() = 1 }, Green }',
      'tasks.withType<Test> { useJUnitPlatform() }',
      'val dto = call.receive<UserDto>() + listOf<Pair<Int, String>>()',
      'if (a < b && c > (d)) x',
      'val f = fun(x: Int): Int { return x }',
      'try { } catch (e: E) { } finally { }',
      'companion object { init { do { } while (x) } }',
    ].join('\n')
    expect(classes(code, 'T): T {')).toEqual([undefined])
    expect(classes(code, 'R): R {')).toEqual([undefined])
    expect(classes(code, 'MAX_SIZE {')).toEqual([undefined])
    expect(classes(code, 'setContent { AppTheme { Column {')).toEqual(['function', undefined, 'function', undefined, 'function', undefined])
    expect(classes(code, 'B, Cee {')).toEqual([undefined, 'type', undefined])
    expect(classes(code, 'RED {')).toEqual([undefined])
    expect(classes(code, 'withType<Test> {')).toEqual(['function', 'operator', 'type', 'operator', undefined])
    expect(classes(code, 'receive<')).toEqual(['function', 'operator'])
    expect(classes(code, 'listOf<Pair')).toEqual(['function', 'operator', 'type'])
    expect(classes(code, 'a < b && c > (d)')).toEqual([undefined, 'operator', undefined, 'operator', undefined, 'operator', undefined])
    expect(classes(code, 'fun(x: Int): Int {')).toEqual(['keyword', undefined, 'type', undefined, 'type', undefined])
    expect(classes(code, 'try { } catch')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, 'finally {')).toEqual(['keyword', undefined])
    expect(classes(code, 'companion object { init { do {')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined])
  })

  it('classifies numbers, operators, and declarations', () => {
    for (const number of ['1_000', '0xFF', '0xFF_EC_DE_5E', '0b1010', '1.5f', '10L', '1e10', '2.5E-3', '42u', '42UL', '3.14']) {
      expect(classes(`val n = ${number}`, number), number).toEqual(['number'])
    }
    const code = 'val v = "1.2.3"; val w = 1.2.3; val ref = String::length; val same = a === b\nfun <T : Comparable<T>> List<T>.maxOf(): T = max()\n@Composable fun Greeting(name: String) { Text("Hi") }\nval MAX_SIZE = x1\nclass Box(val size: Int)\nval task = object : Runnable { }'
    expect(classes(code, 'w = 1.2.3')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'String::length')).toEqual(['type', 'operator', undefined])
    expect(classes(code, '===')).toEqual(['operator'])
    expect(classes(code, 'List<T>.maxOf')).toEqual(['type', 'operator', undefined, 'operator', undefined, 'function'])
    expect(classes(code, 'Greeting')).toEqual(['function'])
    expect(classes(code, 'Text(')).toEqual(['function', undefined])
    expect(classes(code, 'class Box(val')).toEqual(['keyword', undefined, 'type', undefined, 'keyword'])
    expect(classes(code, 'object : Runnable {')).toEqual(['keyword', undefined, 'type', undefined])
    expect(classes(code, 'MAX_SIZE = x1')).toEqual([undefined, 'operator', undefined])
  })

  it('registers only the requested aliases', () => {
    for (const name of ['kotlin', 'kt', 'kts']) {
      expect(highlighter.normalizeLanguage(name)).toBe('kotlin')
    }
    expect(createHighlighter({ languages: [] }).normalizeLanguage('kotlin')).toBe('plaintext')
  })
})
