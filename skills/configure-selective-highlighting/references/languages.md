# Shipped Languages

Import only the definitions the application registers.

| Language | Export | Direct import | Aliases |
| --- | --- | --- | --- |
| Apache | `apache` | `@tanstack/highlight/languages/apache` | - |
| CSS | `css` | `@tanstack/highlight/languages/css` | - |
| Diff | `diff` | `@tanstack/highlight/languages/diff` | `patch` |
| Dockerfile | `dockerfile` | `@tanstack/highlight/languages/dockerfile` | `docker` |
| EJS | `ejs` | `@tanstack/highlight/languages/ejs` | - |
| Env | `env` | `@tanstack/highlight/languages/env` | `dotenv` |
| HTML | `html` | `@tanstack/highlight/languages/html` | `htm`, `xml`, `angular-html` |
| HTTP | `http` | `@tanstack/highlight/languages/http` | - |
| JavaScript | `js` | `@tanstack/highlight/languages/js` | `javascript`, `mjs`, `cjs`, `js-vue` |
| JSON | `json` | `@tanstack/highlight/languages/json` | `jsonc`, `json5` |
| JSX | `jsx` | `@tanstack/highlight/languages/jsx` | - |
| Markdown | `markdown` | `@tanstack/highlight/languages/markdown` | `md` |
| Mermaid | `mermaid` | `@tanstack/highlight/languages/mermaid` | - |
| Nginx | `nginx` | `@tanstack/highlight/languages/nginx` | - |
| Plaintext | `plaintext` | `@tanstack/highlight/languages/plaintext` | `text`, `txt`, `-->` |
| Python | `python` | `@tanstack/highlight/languages/python` | `py` |
| Scheme | `scheme` | `@tanstack/highlight/languages/scheme` | `scm`, `racket` |
| Shell | `shell` | `@tanstack/highlight/languages/shell` | `bash`, `sh`, `zsh`, `cmd`, `console` |
| SQL | `sql` | `@tanstack/highlight/languages/sql` | - |
| Svelte | `svelte` | `@tanstack/highlight/languages/svelte` | - |
| TOML | `toml` | `@tanstack/highlight/languages/toml` | - |
| TypeScript | `ts` | `@tanstack/highlight/languages/ts` | `typescript`, `angular-ts` |
| TSX | `tsx` | `@tanstack/highlight/languages/tsx` | - |
| Vue | `vue` | `@tanstack/highlight/languages/vue` | - |
| YAML | `yaml` | `@tanstack/highlight/languages/yaml` | `yml` |

## Embedded Registration

| Outer language | Optional delegated registrations |
| --- | --- |
| HTML | `js`, `ts`, `css` |
| Vue | `js`, `ts`, `css` |
| Svelte | `js`, `ts`, `css` |
| EJS | `js` |
| Markdown | The language named by each fence |

The aggregate `@tanstack/highlight/languages` entry can tree-shake in a compatible bundler. Direct subpaths make isolation explicit and are the default for size-sensitive clients.
