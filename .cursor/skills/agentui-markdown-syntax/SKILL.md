---
name: agentui-markdown-syntax
description: >-
  Author markdown and structured payloads for @antdigital/agentui-react-native
  (MarkdownRenderer, MessageList, DeepThinking). Use when generating assistant
  replies, SSE/stream content, agent-card JSON fences, GFM tables, font-colored
  metrics, or integrating chat APIs with this library.
---

# Agent UI React Native — content syntax

Target runtime: **`MarkdownRenderer`** inside **`MarkdownThemeProvider`**. Chat apps use **`MessageList`** / **`ChatMessage`**.

## Not supported (do not emit)

- Mermaid, LaTeX/math, Slate/HTML blocks beyond `<font>`, `:::card` / remark directives
- Raw HTML tags other than `<font …>…</font>` (stripped or unsafe URLs shown as plain text)
- `javascript:` / `vbscript:` links and inline event handlers in URLs

## Standard GFM (supported)

| Feature | Notes |
|--------|--------|
| Headings | `#` … `######` |
| Paragraphs, **bold**, *italic*, ~~strike~~ | |
| Links | `[label](https://…)`; use `layoutDensity="compact"` for Figma-style link row on mobile |
| Lists | `-` / `*` / `1.`; task lists `- [ ]` / `- [x]` |
| Blockquote | `>` |
| Code | `` `inline` `` and fenced ` ```lang ` … ` ``` ` |
| Tables | GFM pipes; render full bubble width |
| HR | `---` |
| Images | `![alt](https://url)` |

Fenced code uses normal language tags (e.g. `ts`, `json`). Only **`agent-card`** is special (below).

## Agent card (structured JSON fence)

Use when the API/agent should render a **card UI** instead of free-form markdown inside the fence.

**Syntax (exact fence language):**

````markdown
```agent-card
{ ...valid JSON object... }
```
````

**Rules**

- Fence info string must be **`agent-card`** (case-insensitive in parser).
- Body must be **one JSON object** (pretty-printed or minified). Invalid JSON falls back to a normal code block.
- Prefer **compact JSON on one line** when streaming so the fence closes cleanly.

**Schema (`AgentCardData`)** — all keys optional except you need at least one of title / subtitle / description / highlight / fields:

| Field | Aliases (normalized) |
|-------|----------------------|
| `title` | `cardTitle`, `name`, `heading` |
| `subtitle` | `subTitle`, `caption` |
| `description` | `body`, `summary` |
| `highlight` | `stat`, `metric`, `primary` |
| `fields` | `rows`, `items`, `data` (array of `{ label, value }`) |

Row aliases: `label` ← `header`, `name`, `key`; `value` ← `text`, `content`.

**Example**

````markdown
```agent-card
{"title":"BTC-PERP","subtitle":"Perp · Trade","highlight":"72,732.45 · -2.63%","fields":[{"label":"24H Volume","value":"$456.20 M"},{"label":"Funding Rate","value":"+0.01% / 8H"}]}
```
````

**Host override:** `components.agentCard={({ data }) => …}` on `MarkdownRenderer`. Parse offline with `parseAgentCardJson` / `normalizeAgentCardData`.

## Colored metrics (`<font>`)

HTML **`<font>` only** (via `rehypeFontFromRaw`):

```markdown
- 24h Change: <font color="#FF5B5B">+3.2%</font>
- 72h Change: <font color="#00A870">-1.28%</font>
```

Attributes:

- `color` — CSS color string (e.g. `#FF5B5B`)
- `size` — number px, `Npx`, or legacy `1`–`7`

Works inside list items and paragraphs. Do not nest other HTML inside `<font>`.

## Streaming assistant text

For the **last** assistant message:

- Set `ChatMessage.streaming` / `MarkdownRenderer streaming`
- Set `isFinished: true` when the stream ends (flushes throttle)
- Optional `throttleOptions={{ enabled: true, charsPerFrame: 3 }}`

**Block boundaries:** prefer blank lines between sections so `splitMarkdownBlocks` can seal completed blocks. Keep **entire fenced blocks** (including ` ```agent-card ` … ` ``` `) in one chunk; do not split mid-fence.

## Deep thinking (not markdown)

Reasoning UI is **`ChatMessage.thinking`**, not a markdown directive:

```ts
thinking: {
  status: 'thinking' | 'completed' | 'failed',
  body: 'Markdown string for expandable body',
  label?: string,
  expandable?: boolean,
  defaultExpanded?: boolean,
}
```

`body` uses the same GFM + `<font>` + `agent-card` rules inside **`DeepThinking`**.

## Quick checklist for agents

1. Use GFM + tables for tabular data **or** `agent-card` JSON for card chrome — not both for the same datum unless intentional.
2. Use `<font color="…">` for signed % / PnL colors.
3. Close all fences before stream end; use `agent-card` for API-driven card templates.
4. Avoid unsupported syntax (Mermaid, math, arbitrary HTML).

## More examples

See [examples.md](examples.md).
