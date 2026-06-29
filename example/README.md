# Example app (Expo)

Runs the library against live `../src` (monorepo Metro config).

## Setup

**Use npm only** (not pnpm). One command from repo root:

```bash
npm run example:setup
```

Or manually:

```bash
npm install
cd example
npm install
```

pnpm breaks Metro monorepo resolution (`mdast-util-to-hast`, duplicate Metro versions, config plugins). If you see `node_modules/.pnpm` in paths, delete `node_modules` and `pnpm-lock.yaml`, then reinstall with npm.

If Web shows **500** on `index.bundle` or MIME type `application/json` errors, stop Metro (Ctrl+C), clear cache, and restart:

```bash
cd example
npx expo start --clear
```

Then press `w` for Web. A stale Metro process on port 8081 can keep serving the old broken bundle.

**Cache error** (`Unable to deserialize cloned data`): stale Metro disk cache after switching Node/pnpm/npm. Fix:

```bash
cd example
npm run clean
npm run start:clean
```

Do **not** use pnpm in this repo — use npm only. If you ran `pnpm install`, remove `node_modules` and `pnpm-lock.yaml`, then `npm install` again.

## Run

```bash
npm start
```

From root: `npm run example` (same as `npm run start --prefix example`).

- **Android:** press `a`
- **iOS:** press `i` (macOS)
- **Web:** press `w` or `npm run web` (centered layout, max width 720px)
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
