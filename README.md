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

## API

| Export | Description |
|--------|-------------|
| `MarkdownRenderer` | Main component |
| `useMarkdownToReact` | Hook: markdown string → React tree |
| `markdownToReactSync` | Sync parse (tests / one-off) |
| `useContentThrottle` | Standalone throttle hook |
| `MarkdownThemeProvider` / `defaultTheme` | Theming |

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
