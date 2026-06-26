# Example app (Expo)

Runs the library against live `../src` (monorepo Metro config).

## Setup

From repository root:

```bash
npm install
cd example
npm install
```

## Run

```bash
npm start
```

From root: `npm run example` (same as `npm run start --prefix example`).

- **Android:** press `a`
- **iOS:** press `i` (macOS)
- **Device:** scan QR with Expo Go

## Screens

| Mode (top buttons) | File | What it exercises |
|--------------------|------|-------------------|
| **MessageList** | `MessageListDemo.tsx` | `MessageList`, `ChatMessage[]`, streaming assistant reply |
| **Streaming only** | `StreamingDemo.tsx` | Single `MarkdownRenderer` + throttle |

Entry: `App.tsx` → `index.js`.

## Debug

1. Start Metro (`npm run example`).
2. Open app on emulator or device.
3. Optional: **Run and Debug** → **Attach to Metro (example)** (port `8081`) in `.vscode/launch.json`.

Breakpoints in `../src` work because `metro.config.js` sets `watchFolders` to the repo root and links `@antdigital/agentui-react-native` via `file:..`.

## Key files

| File | Role |
|------|------|
| `metro.config.js` | Parent package + `node_modules` resolution |
| `package.json` | `"@antdigital/agentui-react-native": "file:.."` |
| `MessageListDemo.tsx` | Chat list + simulated stream |
| `StreamingDemo.tsx` | Standalone markdown stream |
