import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { lua } from '../src/languages/lua'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [lua] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'lua')

describe('Lua documentation syntax', () => {
  it('highlights a realistic Neovim plugin module', () => {
    const code = `#!/usr/bin/env lua
-- lua/myplugin/init.lua
local M = {}

---@class Config
M.defaults = {
  enabled = true,
  width = 0.5,
  icons = { error = "", warn = "" },
}

--[[ Setup is idempotent.
  Call it as require("myplugin").setup { ... } ]]
function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", M.defaults, opts or {})
  vim.opt.number = true
  vim.keymap.set("n", "<leader>f", function()
    require("myplugin.finder").open()
  end, { desc = "Find files" })
end

local function count(t)
  local n = 0
  for _, v in ipairs(t) do
    if v ~= nil then n = n + 1 end
  end
  return n, #t
end

function M.Picker:render(items, ...)
  local lines = [[
-- not a comment
]]
  for i = 1, #items, 2 do
    if items[i] == nil then goto continue end
    self.buf[#self.buf + 1] = ("%d: %s"):format(i, items[i])
    ::continue::
  end
  return lines .. select("#", ...)
end

M.on_attach = function(client, bufnr) print "attached" end

return M
`
    expect(classes(code, '#!/usr/bin/env lua')).toEqual(['meta'])
    expect(classes(code, '-- lua/myplugin/init.lua')).toEqual(['comment'])
    expect(classes(code, '---@class Config')).toEqual(['comment'])
    expect(classes(code, '--[[ Setup is idempotent.\n  Call it as require("myplugin").setup { ... } ]]')).toEqual(['comment'])
    expect(classes(code, 'defaults')).toEqual(['property'])
    expect(classes(code, 'true')).toEqual(['literal'])
    expect(classes(code, '0.5')).toEqual(['number'])
    expect(classes(code, 'setup(')).toEqual(['function', undefined])
    expect(classes(code, 'tbl_deep_extend')).toEqual(['function'])
    expect(classes(code, 'opt.number')).toEqual(['property', undefined, 'property'])
    expect(classes(code, '"<leader>f"')).toEqual(['string'])
    expect(classes(code, 'local function count')).toEqual(['keyword', undefined, 'keyword', undefined, 'function'])
    expect(classes(code, 'v ~= nil')).toEqual([undefined, 'operator', undefined, 'literal'])
    expect(classes(code, '#t')).toEqual(['operator', undefined])
    expect(classes(code, 'render')).toEqual(['function'])
    expect(classes(code, '[[\n-- not a comment\n]]')).toEqual(['string'])
    expect(classes(code, 'goto continue end')).toEqual(['keyword', undefined, 'keyword'])
    expect(classes(code, '::continue::')).toEqual(['operator', undefined, 'operator'])
    expect(classes(code, 'format')).toEqual(['function'])
    expect(classes(code, '"#"')).toEqual(['string'])
    expect(classes(code, 'on_attach')).toEqual(['function'])
    expect(classes(code, 'print "attached"')).toEqual(['function', undefined, 'string'])
    expect(classes(code, 'return M')).toEqual(['keyword', undefined])
  })

  it('matches long bracket levels for strings and comments', () => {
    const level1 = '[=[ a ]] b ]==] c ]=]'
    const level2 = '--[==[ "x" ]] ]=] still comment ]==]'
    const code = `local s = ${level1}\n${level2}\nlocal t = [==[\n'quote' -- text\n]==]\nlocal after = 1`
    expect(classes(code, level1)).toEqual(['string'])
    expect(classes(code, level2)).toEqual(['comment'])
    expect(classes(code, "[==[\n'quote' -- text\n]==]")).toEqual(['string'])
    expect(classes(code, 'local after = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes('x = [[unterminated -- "', '[[unterminated -- "')).toEqual(['string'])
    expect(classes('--[[ open\nlocal x = 1', 'local x = 1')).toEqual(['comment'])
  })

  it('opens a block comment only when a long bracket directly follows two dashes', () => {
    const code = '---[[ doc line\nlocal a = 1\n--[ not long\nlocal b = 2\n--[=x\nlocal c = 3\n-- [[ spaced\nlocal d = 4 --]]'
    expect(classes(code, '---[[ doc line')).toEqual(['comment'])
    expect(classes(code, 'local a')).toEqual(['keyword', undefined])
    expect(classes(code, '--[ not long')).toEqual(['comment'])
    expect(classes(code, 'local b')).toEqual(['keyword', undefined])
    expect(classes(code, '--[=x')).toEqual(['comment'])
    expect(classes(code, '-- [[ spaced')).toEqual(['comment'])
    expect(classes(code, 'local d = 4')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '--]]')).toEqual(['comment'])
  })

  it('never mistakes indexing for a long string', () => {
    const code = 'local v = a[b[1]] + t[ [[key]] ] + m[i][j]\nlocal w = 2'
    expect(classes(code, 'a[b[1]]')).toEqual([undefined, 'number', undefined])
    expect(classes(code, '[[key]]')).toEqual(['string'])
    expect(classes(code, 'm[i][j]')).toEqual([undefined])
    expect(classes(code, 'local w = 2')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes('f[[arg]]', 'f[[arg]]')).toEqual(['function', 'string'])
  })

  it('handles quoted string escapes and keeps delimiters inside', () => {
    const escapes = String.raw`"say \"hi\" \\ \x41 \u{48} \065 -- not a comment"`
    const single = String.raw`'it\'s "fine" --[[ no ]]'`
    const skip = '"first \\z\n      second"'
    const continued = '"line \\\nnext"'
    const code = `local a = ${escapes}\nlocal b = ${single}\nlocal c = ${skip}\nlocal d = ${continued}\nlocal e = "unterminated\nlocal f = 1 -- "quoted" 'text'`
    expect(classes(code, escapes)).toEqual(['string'])
    expect(classes(code, single)).toEqual(['string'])
    expect(classes(code, skip)).toEqual(['string'])
    expect(classes(code, continued)).toEqual(['string'])
    expect(classes(code, '"unterminated')).toEqual(['string'])
    expect(classes(code, 'local f = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes(code, `-- "quoted" 'text'`)).toEqual(['comment'])
    expect(classes('x = "a" .. "--b" .. \'c\'', '.. "--b"')).toEqual(['operator', undefined, 'string'])
  })

  it('treats only a leading #! as a shebang', () => {
    const code = '#!/usr/bin/env luajit\nprint(#arg, #"str")'
    expect(classes(code, '#!/usr/bin/env luajit')).toEqual(['meta'])
    expect(classes(code, '#arg')).toEqual(['operator', undefined])
    expect(classes(code, '#"str"')).toEqual(['operator', 'string'])
    expect(classes('local n = #!x', '#')).toEqual(['operator'])
  })

  it('classifies keywords, literals, attribs and labels', () => {
    const code = 'local fh <close> = assert(io.open(path))\nlocal K < const > = 10\nwhile not done and x or y do break end\nrepeat n = n - 1 until n <= 0\nlocal const, close = nil, false\n::retry:: goto retry'
    expect(classes(code, '<close>')).toEqual(['operator', 'keyword', 'operator'])
    expect(classes(code, '< const >')).toEqual(['operator', undefined, 'keyword', undefined, 'operator'])
    expect(classes(code, 'while not done and x or y do break end')).toEqual(['keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword', undefined, 'keyword'])
    expect(classes(code, 'repeat')).toEqual(['keyword'])
    expect(classes(code, 'until n <= 0')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
    expect(classes('local a <constant> = x <const and y > z', 'constant')).toEqual([undefined])
    expect(classes('local a <constant> = x <const and y > z', 'const and')).toEqual([undefined, 'keyword'])
    expect(classes(code, 'local const, close = nil, false')).toEqual(['keyword', undefined, 'operator', undefined, 'literal', undefined, 'literal'])
    expect(classes(code, '::retry:: goto retry')).toEqual(['operator', undefined, 'operator', undefined, 'keyword', undefined])
    expect(classes('return self.items', 'self')).toEqual([undefined])
  })

  it('distinguishes declarations, calls, paren-less calls and member access', () => {
    const code = 'function obj:method(a) end\nlocal handler = function() end\nM.cb = function() end\nrequire "mod"\nrequire\'mod\'\nsetup { a = 1 }\nobj:send("x")\nlocal y = vim.fn.expand\nlocal z = x == f\nif ok then\n  {}\nend'
    expect(classes(code, 'method')).toEqual(['function'])
    expect(classes(code, 'handler')).toEqual(['function'])
    expect(classes(code, 'cb')).toEqual(['function'])
    expect(classes(code, 'require "mod"')).toEqual(['function', undefined, 'string'])
    expect(classes(code, "require'mod'")).toEqual(['function', 'string'])
    expect(classes(code, 'setup {')).toEqual(['function', undefined])
    expect(classes(code, 'send')).toEqual(['function'])
    expect(classes(code, 'fn.expand')).toEqual(['property', undefined, 'property'])
    expect(classes(code, 'x == f')).toEqual([undefined, 'operator', undefined])
    expect(classes(code, 'ok then')).toEqual([undefined, 'keyword'])
    expect(classes('for _, v in ipairs { 1 } do end', 'ipairs')).toEqual(['function'])
    expect(classes('local w = y\n{ 1 }', 'y')).toEqual([undefined])
  })

  it('recognizes Lua and LuaJIT numbers without swallowing concatenation', () => {
    for (const number of ['42', '3.14', '.5', '5.', '1e10', '2.5E-3', '0xFF', '0x1p4', '0xA.8p0', '0x.1P-2', '42LL', '42ull', '0x2AULL', '1i', '12.5i']) {
      expect(classes(`local n = ${number}`, number), number).toEqual(['number'])
    }
    expect(classes('s = 1 .. 2', '1 .. 2')).toEqual(['number', undefined, 'operator', undefined, 'number'])
    expect(classes('s = name..1', 'name..1')).toEqual([undefined, 'operator', 'number'])
    expect(classes('s = a..b', 'a..b')).toEqual([undefined, 'operator', undefined])
    expect(classes('f(...)', '...')).toEqual(['operator'])
    expect(classes('v = x1 + version 1.2.3', 'x1')).toEqual([undefined])
    expect(classes('v = 1.2.3', '1.2.3')).toEqual([undefined])
  })

  it('classifies operators and leaves punctuation plain', () => {
    const code = 'r = a // b % c ^ d << 1 >> 2 & e | f ~ g ~= h >= i <= j == k'
    for (const op of ['//', '%', '^', '<<', '>>', '&', '|', '~ g', '~=', '>=', '<=', '==']) {
      expect(classes(code, op)[0], op).toBe('operator')
    }
    expect(classes('t = { a, b; c }', '{ a, b; c }')).toEqual([undefined])
  })

  it('tolerates Luau type annotations without classifying them', () => {
    const code = 'local function add(a: number, b: number): number\n  return a + b\nend\ntype Point = { x: number }'
    expect(classes(code, 'add')).toEqual(['function'])
    expect(classes(code, 'a: number,')).toEqual([undefined])
    expect(classes(code, 'return a + b')).toEqual(['keyword', undefined, 'operator', undefined])
    expect(classes(code, 'type Point')).toEqual([undefined])
    const interp = "`{player.Name} has {data[\"coins\"]} -- it's {n}`"
    expect(classes(`print(${interp})\nlocal z = 1`, interp)).toEqual(['string'])
    expect(classes(`print(${interp})\nlocal z = 1`, 'local z = 1')).toEqual(['keyword', undefined, 'operator', undefined, 'number'])
  })

  it('registers no aliases', () => {
    expect(highlighter.normalizeLanguage('lua')).toBe('lua')
    expect(highlighter.normalizeLanguage('luau')).toBe('plaintext')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('lua')).toBe('plaintext')
  })
})
