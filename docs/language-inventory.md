# TanStack Docs Language Inventory

Generated from local markdown and MDX files in:

- Sibling repositories under `../*/docs`
- The sibling `../tanstack.com` repository

The scan parses fenced code blocks statefully, so closing fences are not counted as plaintext blocks. Hidden directories and this `highlight` package are ignored.

Scanned files: `2940`

Generated real-code fixtures:

```sh
pnpm run extract:fixtures
```

The current fixture set stores up to twenty sampled code fences per normalized language target in `test/generated/tanstack-doc-fixtures.json`.

## Raw Fence Tags

| Count | Tag |
| ---: | --- |
| 8173 | `ts` |
| 4078 | `tsx` |
| 904 | `js` |
| 877 | `typescript` |
| 561 | `bash` |
| 226 | `plaintext` |
| 211 | `json` |
| 136 | `sh` |
| 107 | `vue` |
| 96 | `jsx` |
| 86 | `svelte` |
| 51 | `angular-ts` |
| 43 | `text` |
| 38 | `txt` |
| 33 | `mermaid` |
| 33 | `shell` |
| 28 | `html` |
| 26 | `js-vue` |
| 21 | `yaml` |
| 15 | `toml` |
| 14 | `javascript` |
| 11 | `css` |
| 11 | `markdown` |
| 11 | `md` |
| 11 | `sql` |
| 9 | `angular-html` |
| 8 | `http` |
| 6 | `env` |
| 4 | `dockerfile` |
| 4 | `nginx` |
| 4 | `python` |
| 3 | `diff` |
| 3 | `xml` |
| 2 | `apache` |
| 2 | `dotenv` |
| 2 | `ejs` |
| 1 | `-->` |
| 1 | `jsonc` |
| 1 | `scheme` |

## Normalized Support Targets

`-->` is malformed markdown and is normalized to `plaintext`.

| Target | Aliases |
| --- | --- |
| `tsx` | `tsx` |
| `ts` | `ts`, `typescript`, `angular-ts` |
| `jsx` | `jsx` |
| `js` | `js`, `javascript`, `js-vue` |
| `shell` | `bash`, `sh`, `shell` |
| `json` | `json`, `jsonc` |
| `plaintext` | `plaintext`, `text`, `txt`, `-->` |
| `vue` | `vue` |
| `svelte` | `svelte` |
| `html` | `html`, `angular-html`, `xml` |
| `markdown` | `md`, `markdown` |
| `yaml` | `yaml` |
| `css` | `css` |
| `diff` | `diff` |
| `mermaid` | `mermaid` |
| `toml` | `toml` |
| `sql` | `sql` |
| `http` | `http` |
| `env` | `env`, `dotenv` |
| `dockerfile` | `dockerfile` |
| `nginx` | `nginx` |
| `python` | `python` |
| `apache` | `apache` |
| `ejs` | `ejs` |
| `scheme` | `scheme` |

## Contract

The highlighter output should be one HTML tree with stable semantic classes. Theme switching should happen in CSS, not by duplicating HTML, embedding inline colors, or re-tokenizing for light and dark themes.
