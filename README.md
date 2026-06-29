# @antdigital/agentui-react-native

React Native UI for agent chat, aligned with [@ant-design/agentic-ui](https://github.com/ant-design/agentic-ui) where it matters: **Markdown** (`unified` → HAST → React Native) and a **minimal message list** (simplified `BubbleList`).

## Features

| Module | Description |
|--------|-------------|
| **MarkdownRenderer** | GFM markdown, block-level streaming (sealed/tail), optional character throttle |
| **MessageList** | `FlatList` chat UI: user right / assistant left, each body uses `MarkdownRenderer` |

Not included (see agentic-ui on web): avatars, like/dislike/copy, thought chain, Mermaid, math, Slate editor, plugin code routers.

## Requirements

- React >= 18
- React Native >= 0.73

## Install

```bash
npm install @antdigital/agentui-react-native
```

Peer dependencies: `react`, `react-native`.

Markdown pipeline packages (`unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `hast-util-to-jsx-runtime`) are **dependencies** of this package; you normally do not add them separately.

## Quick start

Wrap your tree in `MarkdownThemeProvider` once (required for markdown colors/typography).

```tsx
import {
  MarkdownThemeProvider,
  MessageList,
  type ChatMessage,
} from '@antdigital/agentui-react-native';

const messages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello' },
  {
    id: '2',
    role: 'assistant',
    content: '## Hi\n\nMarkdown **works**.',
    isFinished: true,
  },
];

export function ChatScreen() {
  return (
    <MarkdownThemeProvider>
      <MessageList messages={messages} autoScrollToBottom />
    </MarkdownThemeProvider>
  );
}
```

## MarkdownRenderer

Renders a markdown string as native `View` / `Text` (and related primitives).

```tsx
import { MarkdownRenderer, MarkdownThemeProvider } from '@antdigital/agentui-react-native';

<MarkdownThemeProvider>
  <MarkdownRenderer content="# Title\n\nParagraph with **bold**." />
</MarkdownThemeProvider>
```

**Supported (GFM subset):** headings, paragraphs, bold/italic/strike, links, lists, task lists, blockquote, inline/fenced code, tables, horizontal rule, images (URL).

**Agent cards:** fenced block with language `agent-card` and a JSON body — rendered as a structured card (or override via `components.agentCard`):

````markdown
```agent-card
{"title":"BTC-PERP","highlight":"72,732.45 · -2.63%","fields":[{"label":"24h","value":"+3.2%"}]}
```
````

### Streaming (SSE / token stream)

```tsx
<MarkdownRenderer
  content={partialMarkdown}
  streaming
  isFinished={streamDone}
  throttleOptions={{ enabled: true, charsPerFrame: 3 }}
/>
```

- **Character throttle** — shows text gradually as `content` grows.
- **Block split** — finished blocks stay cached (`sealed`); only the last block re-parses often (`tail`).
- `throttleOptions.fade` — accepted for API parity with web; **no visual effect** on React Native.

Use on the last assistant message in a list via `ChatMessage.streaming` / `isFinished` (see below).

## MessageList

Minimal chat list: no toolbar actions, no avatars.

### `ChatMessage`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `string` | Stable key for `FlatList` (host assigns; do not change while streaming) |
| `role` | `'user' \| 'assistant'` | Layout: user right, assistant left |
| `content` | `string` | Markdown source |
| `streaming?` | `boolean` | Usually last assistant message only |
| `isFinished?` | `boolean` | When true, throttle flushes remaining text |

### `MessageList` props

| Prop | Default | Description |
|------|---------|-------------|
| `messages` | — | Array of `ChatMessage` |
| `autoScrollToBottom` | `true` | Scroll when length or last `content` changes |
| `throttleOptions` | — | Passed to each bubble’s `MarkdownRenderer` |
| `chatTheme` | `defaultChatTheme` | Bubble colors, padding, gap (`mergeChatTheme`) |
| `style` / `contentContainerStyle` | — | `FlatList` styles |

```tsx
<MessageList
  messages={messages}
  autoScrollToBottom
  throttleOptions={{ enabled: true }}
  chatTheme={{ userBubbleBackground: '#e6f4ff' }}
/>
```

Single-message layout: use `MessageBubble` + `MarkdownRenderer` directly (both exported).

## API exports

| Export | Description |
|--------|-------------|
| `MarkdownRenderer` | Markdown → RN tree |
| `MessageList` / `MessageBubble` | Chat list / single row |
| `useMarkdownToReact` | Hook (block streaming pipeline) |
| `markdownToReactSync` | Sync parse (tests) |
| `useContentThrottle` | Character throttle only |
| `MarkdownThemeProvider` / `defaultTheme` | Markdown typography & colors |
| `defaultChatTheme` / `mergeChatTheme` | Bubble chrome |
| `createHastProcessor`, `splitMarkdownBlocks`, `shouldReparseLastBlock` | Advanced / streaming internals |

Types: `ChatMessage`, `MessageListProps`, `MarkdownRendererProps`, `ContentThrottleOptions`, `ChatTheme`, `MarkdownTheme`, …

## Example app (Expo)

From repo root:

```bash
npm install
cd example && npm install
npm run example
```

Or: `npm run example` from root.

The example includes:

- **MessageList** — static thread + “Stream reply” (assistant streaming in the list)
- **Streaming only** — single `MarkdownRenderer` demo

Details: [example/README.md](example/README.md).

Debug: breakpoints in `example/*.tsx` or `src/**`; Metro resolves the library via `react-native` → `src/index.ts`.

## Develop

```bash
npm install
npm run typecheck
npm test
npm run build
```

Output: `lib/` (published `main` / `types`). Local Expo example uses `src/` via Metro `watchFolders`.

## Relation to agentic-ui

| Web (`agentic-ui`) | This package |
|--------------------|--------------|
| `MarkdownRenderer` + remark/rehype plugins | Slim processor (GFM only) |
| `BubbleList` / `PureBubbleList` | `MessageList` |
| Ant Design, CSS fade tokens | RN `View`/`Text`, no fade |

## License

MIT
