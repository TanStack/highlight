import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { ruby } from '../src/languages/ruby'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [ruby] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'ruby')

describe('Ruby documentation syntax', () => {
  it('highlights a realistic library example', () => {
    const code = `#!/usr/bin/env ruby
# frozen_string_literal: true
require 'json'

module Shop
  class Cart < Base
    include Enumerable
    attr_reader :items, :owner
    MAX_ITEMS = 1_000
    @@count = 0

    def initialize(owner:, items: [])
      @owner = owner
      @items = items
      @@count += 1
    end

    def self.build(name) = new(owner: name)

    def total
      @items.sum { |item| item[:price] * item.fetch(:qty, 1) }
    end

    def ==(other)
      other.is_a?(Cart) && items == other.items
    end

    def to_s
      "#{owner}: #{items.map { |i| "<#{i[:name]}>" }.join(", ")}"
    end

    def to_sql
      <<~SQL.strip
        SELECT * FROM carts # not a comment
        WHERE owner = '#{owner}'
      SQL
    end

    def valid?
      raise ArgumentError, "too many" if items.size > MAX_ITEMS
      !@owner.nil? && $stdout.tty?
    end
  end
end
`
    expect(classes(code, '#!/usr/bin/env ruby')).toEqual(['meta'])
    expect(classes(code, '# frozen_string_literal: true')).toEqual(['comment'])
    expect(classes(code, 'require')).toEqual(['keyword'])
    expect(classes(code, "'json'")).toEqual(['string'])
    expect(classes(code, 'Shop')).toEqual(['type'])
    expect(classes(code, 'Cart <')).toEqual(['type', undefined, 'operator'])
    expect(classes(code, 'Enumerable')).toEqual(['type'])
    expect(classes(code, 'attr_reader')).toEqual(['keyword'])
    expect(classes(code, ':items')).toEqual(['string'])
    expect(classes(code, 'MAX_ITEMS =')).toEqual([undefined, 'operator'])
    expect(classes(code, '1_000')).toEqual(['number'])
    expect(classes(code, '@@count')).toEqual(['variable'])
    expect(classes(code, 'initialize')).toEqual(['function'])
    expect(classes(code, 'owner:,')).toEqual(['property', undefined])
    expect(classes(code, 'self.build')).toEqual(['literal', undefined, 'function'])
    expect(classes(code, '|item|')).toEqual([undefined])
    expect(classes(code, '.sum')).toEqual([undefined, 'property'])
    expect(classes(code, 'fetch')).toEqual(['function'])
    expect(classes(code, 'def ==')).toEqual(['keyword', undefined, 'function'])
    expect(classes(code, 'is_a?')).toEqual(['function'])
    expect(classes(code, '"#{owner}: #{items.map { |i| "<#{i[:name]}>" }.join(", ")}"')).toEqual(['string'])
    expect(classes(code, '<<~SQL.strip')).toEqual(['string', undefined, 'property'])
    expect(classes(code, "SELECT * FROM carts # not a comment\n        WHERE owner = '#{owner}'\n      SQL")).toEqual(['string'])
    expect(classes(code, 'valid?')).toEqual(['function'])
    expect(classes(code, 'ArgumentError')).toEqual(['type'])
    expect(classes(code, '!@owner.nil?')).toEqual(['operator', 'variable', undefined, 'property'])
    expect(classes(code, '$stdout')).toEqual(['variable'])
  })

  it('finds the end of interpolated strings with nested quotes and braces', () => {
    const nested = '"#{h["k"]} and #{items.map { |i| "<#{i}>" }.join}"'
    const code = `out = ${nested} + "#{'}'}" + 'it\\'s #{raw}' # done`
    expect(classes(code, nested)).toEqual(['string'])
    expect(classes(code, `"#{'}'}"`)).toEqual(['string'])
    expect(classes(code, "'it\\'s #{raw}'")).toEqual(['string'])
    expect(classes(code, '# done')).toEqual(['comment'])
    expect(classes('cmd = `ls #{dir}` # c', '`ls #{dir}`')).toEqual(['string'])
    const deep = `${'"#{'.repeat(20)}x${'}"'.repeat(20)} # c`
    expect(classes(deep, '# c').at(-1)).toBe('comment')
    const regexes = `s = "#{q.sub(/"/, '')} #{/['"]/.match(z)} #{x / 2} #{y /2}" + "#{a.gsub(/\\//, "-")}" # c`
    expect(classes(regexes, `"#{q.sub(/"/, '')} #{/['"]/.match(z)} #{x / 2} #{y /2}"`)).toEqual(['string'])
    expect(classes(regexes, '"#{a.gsub(/\\//, "-")}"')).toEqual(['string'])
    expect(classes(regexes, '# c')).toEqual(['comment'])
  })

  it('scans percent literals with nested delimiters and keeps modulo operators', () => {
    const code = 'tags = %w[a b] + %i[c d]\nq = %q(it\'s (nested) "x") + %Q{a {#{b}} c} + %(plain)\nre = %r{/path/(\\d+)}i\ncmd = %x(ls #{dir})\nr = a % b\nx %= 2\ns = "%05d" % n'
    for (const literal of ['%w[a b]', '%i[c d]', '%q(it\'s (nested) "x")', '%Q{a {#{b}} c}', '%(plain)', '%r{/path/(\\d+)}i', '%x(ls #{dir})']) {
      expect(classes(code, literal), literal).toEqual(['string'])
    }
    expect(classes(code, 'a % b')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'x %= 2')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, '"%05d" % n')).toEqual(['string', undefined, 'operator', undefined])
    expect(classes('puts %w[x y]', '%w[x y]')).toEqual(['string'])
  })

  it('reads heredoc bodies until their terminator line', () => {
    const code = `a = <<~SQL.strip
  SELECT 1 # "x
SQL
b = <<-EOS
  'unclosed
  EOS
c = <<EOS
raw
EOS
d = <<~'RAW'
  #{not interpolated}
RAW
puts(<<~ONE, <<~TWO)
  first
ONE
  second
TWO
after = 1
arr << item
class << self
end`
    expect(classes(code, '<<~SQL.strip')).toEqual(['string', undefined, 'property'])
    expect(classes(code, '  SELECT 1 # "x\nSQL')).toEqual(['string'])
    expect(classes(code, "  'unclosed\n  EOS")).toEqual(['string'])
    expect(classes(code, 'raw\nEOS')).toEqual(['string'])
    expect(classes(code, "<<~'RAW'")).toEqual(['string'])
    expect(classes(code, '  #{not interpolated}\nRAW')).toEqual(['string'])
    expect(classes(code, '  first\nONE')).toEqual(['string'])
    expect(classes(code, '  second\nTWO')).toEqual(['string'])
    expect(classes(code, 'after = 1')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, 'arr << item')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'class << self')).toEqual(['keyword', undefined, 'operator', undefined, 'literal'])
  })

  it('separates regex literals from division', () => {
    const code = 'r = /ab+c/i\nok = x =~ /\\d+/\nputs 1 if /foo/.match?(s)\nparts = s.split(/,\\s*/)\nwords = s.split /\\s+/\nq = a / b\navg = total / count\nx /= 2\nz = (a + b) / (c - d) / 2\nh = h[:k] / 2 # / not regex\nm = path !~ %r{^/#}'
    for (const regex of ['/ab+c/i', '/\\d+/', '/foo/', '/,\\s*/', '/\\s+/', '%r{^/#}']) {
      expect(classes(code, regex), regex).toEqual(['string'])
    }
    expect(classes(code, 'a / b')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'total / count')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'x /= 2')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, ') / (c - d) / 2')).toEqual([undefined, 'operator', undefined, 'operator', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '] / 2 # / not regex')).toEqual([undefined, 'operator', undefined, 'number', undefined, 'comment'])
    expect(classes(code, '.match?')).toEqual([undefined, 'function'])
    expect(classes(code, '=~')).toEqual(['operator'])
    expect(classes(code, '!~')).toEqual(['operator'])
    expect(classes('x = y /2\nz = 1', '/2\nz = 1')).toEqual(['operator', 'number', undefined, 'operator', undefined, 'number'])
  })

  it('does not open regex, percent or heredoc literals in everyday arithmetic', () => {
    const code = `x = y / z; w = 1 / 2
pct = count / total * 100 + [1, 2].sum / 2 + obj.size / 2 + @total / @count + x.to_f / y
puts(a / b / c) if x / 2 > 1
odd = total /count * 100 / 2
mid = width /2 - height/2
m = value % 10 + i % 2 + 10 % 3 + a % (b + c) + h[k] / 2
list << Item.new
io << "a" << CONSTANT
mask = 1 << 2
rows = DB.query(<<~SQL, limit: 10)
  SELECT * FROM t -- "q" / 50% <<x #{id}
SQL
done = true`
    const ops = (text: string) => classes(code, text).filter(Boolean)
    expect(ops('y / z; w = 1 / 2')).toEqual(['operator', 'operator', 'number', 'operator', 'number'])
    expect(ops('count / total * 100 + [1, 2].sum / 2 + obj.size / 2 + @total / @count + x.to_f / y')).not.toContain('string')
    expect(ops('a / b / c) if x / 2 > 1')).toEqual(['operator', 'operator', 'keyword', 'operator', 'number', 'operator', 'number'])
    expect(ops('total /count * 100 / 2')).toEqual(['operator', 'operator', 'number', 'operator', 'number'])
    expect(ops('width /2 - height/2')).toEqual(['operator', 'number', 'operator', 'operator', 'number'])
    expect(ops('value % 10 + i % 2 + 10 % 3 + a % (b + c) + h[k] / 2')).not.toContain('string')
    expect(classes(code, 'list << Item.new')).toEqual([undefined, 'operator', undefined, 'type', undefined, 'property'])
    expect(classes(code, 'io << "a" << CONSTANT')).toEqual([undefined, 'operator', undefined, 'string', undefined, 'operator', undefined])
    expect(classes(code, '(<<~SQL, limit: 10)')).toEqual([undefined, 'string', undefined, 'property', undefined, 'number', undefined])
    expect(classes(code, '  SELECT * FROM t -- "q" / 50% <<x #{id}\nSQL')).toEqual(['string'])
    expect(classes(code, 'done = true')).toEqual([undefined, 'operator', undefined, 'literal'])
  })

  it('distinguishes symbols, hash keys, scope operators and ternaries', () => {
    const code = 'opts = { key: :value, "str": 1, :"sym bol" => nil, :old=>2 }\nFoo::Bar::BAZ\nx = cond ? first : second\ny = flag ? :yes : :no\nsend(:empty?)'
    expect(classes(code, 'key: :value')).toEqual(['property', undefined, 'string'])
    expect(classes(code, '"str": 1')).toEqual(['string', undefined, 'number'])
    expect(classes(code, ':"sym bol" => nil')).toEqual(['string', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, ':old=>2')).toEqual(['string', 'operator', 'number'])
    expect(classes(code, 'Foo::Bar::BAZ')).toEqual(['type', 'operator', 'type', 'operator', undefined])
    expect(classes(code, 'cond ? first : second')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'flag ? :yes : :no')).toEqual([undefined, 'operator', undefined, 'string', undefined, 'string'])
    expect(classes(code, ':empty?')).toEqual(['string'])
  })

  it('keeps comments, block comments, and hashes inside strings apart', () => {
    const code = '=begin\nputs "not code" # still doc\n=end\nx = "a # b" # real \'comment\'\ny = \'#{no}\'\nz = "#$1 #@name"\nv = $\' + $" + $~[0] + $0'
    expect(classes(code, '=begin\nputs "not code" # still doc\n=end')).toEqual(['comment'])
    expect(classes(code, '"a # b"')).toEqual(['string'])
    expect(classes(code, "# real 'comment'")).toEqual(['comment'])
    expect(classes(code, "'#{no}'")).toEqual(['string'])
    expect(classes(code, '"#$1 #@name"')).toEqual(['string'])
    expect(classes(code, '$\' + $" + $~')).toEqual(['variable', undefined, 'operator', undefined, 'variable', undefined, 'operator', undefined, 'variable'])
    expect(classes(code, '$0')).toEqual(['variable'])
    expect(classes('x = 1 =begin', '=begin')).toEqual(['operator', 'keyword'])
  })

  it('classifies keywords, literals, numbers and operators', () => {
    const code = 'def name!; end\ndef self.call?(x) = x\nreturn nil unless defined?(y) && x.class == Foo\nnums = [1_000, 0x1F, 0b1010, 0o17, 017, 1.5e3, 3r, 2i, 1..10, 1...10]\nv = 1.2.3\nf = ->(a, b) { a <=> b ** 2 }\nres&.call || @memo ||= true\na === b; @flag &&= false; obj.then { _1 }\nMAX_SIZE = 1'
    expect(classes(code, 'name!')).toEqual(['function'])
    expect(classes(code, 'self.call?')).toEqual(['literal', undefined, 'function'])
    expect(classes(code, 'return nil unless defined?')).toEqual(['keyword', undefined, 'literal', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, '.class')).toEqual([undefined, 'property'])
    expect(classes(code, '.then')).toEqual([undefined, 'property'])
    for (const number of ['1_000', '0x1F', '0b1010', '0o17', '017', '1.5e3', '3r', '2i']) {
      expect(classes(code, number), number).toEqual(['number'])
    }
    expect(classes(code, '1..10')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, '1...10')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, '1.2.3')).toEqual([undefined])
    for (const operator of ['->', '<=>', '**', '&.', '||', '||=', '===', '&&=']) {
      expect(classes(code, operator), operator).toEqual(['operator'])
    }
    expect(classes(code, 'MAX_SIZE')).toEqual([undefined])
  })

  it('registers only the requested aliases', () => {
    expect(highlighter.normalizeLanguage('ruby')).toBe('ruby')
    expect(highlighter.normalizeLanguage('rb')).toBe('ruby')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('rb')).toBe('plaintext')
  })
})
