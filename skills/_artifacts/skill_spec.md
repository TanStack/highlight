# TanStack Highlight - Skill Spec

TanStack Highlight is a dependency-free, class-based syntax highlighter for documentation code. It uses explicit language registration, synchronous tokenization, and stable semantic CSS classes across server and client rendering.

## Domains

| Domain | Description | Skills |
| --- | --- | --- |
| Highlighting configuration | Choose and share a minimal language registry. | `configure-selective-highlighting` |
| Documentation pipelines | Transform Markdown and framework code blocks. | `integrate-markdown-pipelines`, `integrate-framework-code-blocks` |
| Output presentation | Apply themes and source annotations. | `theme-and-annotate-code` |
| Language extension | Add isolated tokenizers and embedded delegation. | `extend-language-support` |

## Skill Inventory

| Skill | Type | Domain | What it covers | Failure modes |
| --- | --- | --- | --- | ---: |
| Configure selective highlighting | core | Highlighting configuration | Registry construction, aliases, fallback, isolated imports, SSR/client sharing | 5 |
| Integrate Markdown pipelines | composition | Documentation pipelines | Direct fences, Remark, Rehype, structured HAST, metadata | 5 |
| Integrate framework code blocks | composition | Documentation pipelines | React data, Octane data and MDX, hydrated SSR | 4 |
| Theme and annotate code | core | Output presentation | Theme CSS, isolated themes, lines, ranges, data | 5 |
| Extend language support | core | Language extension | Token ranges, priority, embedding, isolation, quality gates | 5 |

## Failure Mode Inventory

### Configure selective highlighting (5 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| ---: | --- | --- | --- | --- |
| 1 | Importing the root entry in size-sensitive clients | CRITICAL | `docs/guides/language-registration.md` | - |
| 2 | Creating a registry for every code block | HIGH | `docs/guides/language-registration.md` | - |
| 3 | Assuming unregistered languages are auto-detected | HIGH | `src/core.ts` | - |
| 4 | Registering different languages on server and client | CRITICAL | `docs/guides/ssr-and-client.md` | `integrate-framework-code-blocks` |
| 5 | Omitting registered languages needed by embedded code | HIGH | `docs/guides/embedded-languages.md` | `extend-language-support` |

### Integrate Markdown pipelines (5 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| ---: | --- | --- | --- | --- |
| 1 | Using the Markdown language as a pipeline adapter | HIGH | `docs/guides/markdown-pipelines.md` | - |
| 2 | Running the Remark plugin after remark-rehype | CRITICAL | `docs/guides/markdown-pipelines.md` | - |
| 3 | Enabling raw HTML for ordinary Remark highlighting | HIGH | `src/remark.ts` | - |
| 4 | Passing unsupported HAST shapes to Rehype | HIGH | `docs/guides/markdown-pipelines.md` | - |
| 5 | Trimming code differently across rendering paths | CRITICAL | `docs/guides/ssr-and-client.md` | `integrate-framework-code-blocks` |

### Integrate framework code blocks (4 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| ---: | --- | --- | --- | --- |
| 1 | Nesting complete markup inside another code block | HIGH | `docs/guides/react.md` | - |
| 2 | Passing arbitrary HTML through highlighted markup props | CRITICAL | `docs/guides/react.md` | - |
| 3 | Highlighting server-rendered blocks again during hydration | HIGH | `docs/guides/ssr-and-client.md` | - |
| 4 | Passing a bare transformer to Octane MDX | HIGH | `docs/guides/octane.md` | - |

### Theme and annotate code (5 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| ---: | --- | --- | --- | --- |
| 1 | Rendering separate highlighted trees for each theme | HIGH | `docs/guides/themes.md` | - |
| 2 | Importing all themes for one selected theme | MEDIUM | `docs/guides/themes.md` | - |
| 3 | Defining an incomplete custom theme token record | HIGH | `docs/guides/themes.md` | - |
| 4 | Using zero-based or half-open line decorations | HIGH | `docs/guides/annotations.md` | - |
| 5 | Expecting annotation classes to include visual styles | MEDIUM | `docs/guides/annotations.md` | - |

### Extend language support (5 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| ---: | --- | --- | --- | --- |
| 1 | Returning inclusive or character-counted token offsets | CRITICAL | `docs/guides/custom-languages.md` | - |
| 2 | Returning overlapping token ranges | HIGH | `src/core.ts` | - |
| 3 | Importing embedded language definitions inside a tokenizer | CRITICAL | `docs/guides/custom-languages.md` | `configure-selective-highlighting` |
| 4 | Inventing language-specific token class names | HIGH | `src/core.ts` | - |
| 5 | Adding a language without focused quality gates | CRITICAL | `docs/guides/custom-languages.md` | - |

## Tensions

| Tension | Skills | Agent implication |
| --- | --- | --- |
| Convenience versus client size | `configure-selective-highlighting` <-> `integrate-framework-code-blocks` | Root helpers can retain all languages in a hydrated client. |
| Structured output versus raw HTML | `integrate-markdown-pipelines` <-> `integrate-framework-code-blocks` | Raw Markdown HTML may be enabled unnecessarily or arbitrary HTML may be treated as generated markup. |
| Language isolation versus embedding depth | `configure-selective-highlighting` <-> `extend-language-support` | Embedded dependencies may be hidden or assumed to exist without registration. |
| Exact source versus block normalization | `integrate-markdown-pipelines` <-> `integrate-framework-code-blocks` | Mixing core and block APIs can change trailing whitespace and output. |

## Cross-References

| From | To | Reason |
| --- | --- | --- |
| `configure-selective-highlighting` | `extend-language-support` | Registration controls aliases and embedded delegation. |
| `configure-selective-highlighting` | `integrate-framework-code-blocks` | Hydration requires matching registries and versions. |
| `integrate-markdown-pipelines` | `theme-and-annotate-code` | Fence metadata produces line and decoration output. |
| `integrate-markdown-pipelines` | `integrate-framework-code-blocks` | MDX builds and direct components use different adapters with one output contract. |
| `integrate-framework-code-blocks` | `configure-selective-highlighting` | Hydrated clients need a selective isomorphic registry. |
| `theme-and-annotate-code` | `integrate-markdown-pipelines` | Fence metadata is the standard source of documentation annotations. |
| `extend-language-support` | `configure-selective-highlighting` | Optional embedded definitions require explicit registration. |

## Subsystems & Reference Candidates

| Skill | Subsystems | Reference candidates |
| --- | --- | --- |
| `configure-selective-highlighting` | - | Language names, aliases, and isolated imports |
| `integrate-markdown-pipelines` | Direct helpers, Remark, Rehype | - |
| `integrate-framework-code-blocks` | React, Octane components, Octane MDX | - |
| `theme-and-annotate-code` | - | Semantic token classes and shipped themes |
| `extend-language-support` | - | Tokenizer implementation patterns |

## Remaining Gaps

| Skill | Question | Status |
| --- | --- | --- |
| `integrate-framework-code-blocks` | Which React and Octane conventions recur in external documentation sites? | open |
| `extend-language-support` | Which valid documentation constructs should drive the next language-quality work? | open |

The gaps remain because the new public repository has no issues, pull requests, or Discussions. The maintainer explicitly requested discovery from repository documentation and source instead of an interview.

## Recommended Skill File Structure

- **Core skills:** `configure-selective-highlighting`, `theme-and-annotate-code`, `extend-language-support`
- **Framework skills:** none; the React and Octane entries are runtime-free data adapters
- **Lifecycle skills:** none; the library has no persistent runtime lifecycle
- **Composition skills:** `integrate-markdown-pipelines`, `integrate-framework-code-blocks`
- **Reference files:** language inventory and patterns, Markdown adapter variants, framework adapter variants, semantic token and theme matrix

## Composition Opportunities

| Library | Integration points | Composition skill needed? |
| --- | --- | --- |
| Remark and remark-rehype | MDAST code nodes and structured HAST data | Yes - `integrate-markdown-pipelines` |
| Rehype | Existing pre/code HAST nodes | Yes - `integrate-markdown-pipelines` |
| React | Application-owned code block rendering and hydration | Yes - `integrate-framework-code-blocks` |
| @octanejs/mdx | Rehype plugin tuples and synchronous compilation | Yes - `integrate-framework-code-blocks` |
