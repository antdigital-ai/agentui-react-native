# @antdigital/agentui-react-native

React Native UI primitives for agent chat experiences. The first module is a **Markdown renderer** aligned with [@ant-design/agentic-ui](https://github.com/ant-design/agentic-ui) (`unified` → HAST → React), with **streaming** support (character throttle + block-level sealed/tail caching).

## Requirements

- React >= 18
- React Native >= 0.73

## Install

```bash
npm install @antdigital/agentui-react-native unified remark-parse remark-gfm remark-rehype hast-util-to-jsx-runtime
```

Peer dependencies: `react`, `react-native`.

## Usage

```tsx
import { MarkdownRenderer, MarkdownThemeProvider } from '@antdigital/agentui-react-native';

export function MessageBody({ text }: { text: string }) {
  return (
    <MarkdownThemeProvider>
      <MarkdownRenderer content={text} />
    </MarkdownThemeProvider>
  );
}
```

### Streaming (SSE / token stream)

```tsx
<MarkdownRenderer
  content={partialMarkdown}
  streaming
  isFinished={done}
  throttleOptions={{ enabled: true, charsPerFrame: 3 }}
/>
```

- **Character throttle**: reveals text gradually while tokens arrive.
- **Block split**: completed paragraphs stay stable (`sealed` blocks); only the last block re-parses (`tail`).
- `throttleOptions.fade` is accepted for API compatibility with web but has **no visual effect** on native.

See [example/README.md](example/README.md) for running and debugging the streaming demo in React Native.

### MessageList (minimal chat UI)

Simplified counterpart to agentic-ui `BubbleList`: left/right bubbles, `FlatList`, and `MarkdownRenderer` per message. No avatars, actions, or thought chain.

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
    streaming: false,
    isFinished: true,
  },
];

<MarkdownThemeProvider>
  <MessageList
    messages={messages}
    autoScrollToBottom
    throttleOptions={{ enabled: true }}
  />
</MarkdownThemeProvider>
```

Wrap the tree in `MarkdownThemeProvider` (same as standalone `MarkdownRenderer`). Optional `chatTheme` adjusts bubble colors and spacing.

## API

| Export | Description |
|--------|-------------|
| `MarkdownRenderer` | Main component |
| `useMarkdownToReact` | Hook: markdown string → React tree |
| `markdownToReactSync` | Sync parse (tests / one-off) |
| `useContentThrottle` | Standalone throttle hook |
| `MarkdownThemeProvider` / `defaultTheme` | Theming |
| `MessageList` / `MessageBubble` | Minimal chat list |
| `defaultChatTheme` / `ChatMessage` | List bubble styling and data shape |

## Develop

```bash
npm install
npm run typecheck
npm test
npm run build
```

### Debug `StreamingDemo` (Expo)

```bash
cd example && npm install && npm start
# or: npm run example
```

See [example/README.md](example/README.md).

## License

MIT
