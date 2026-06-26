# Streaming demo (React Native debug)

Expo app that mounts [`StreamingDemo.tsx`](./StreamingDemo.tsx) so you can run and debug Markdown streaming on a simulator, device, or Expo Go.

## One-time setup

From the **repository root**:

```bash
npm install
cd example
npm install
```

## Run

From `example/`:

```bash
npm start
```

Or from the repo root:

```bash
npm run example
```

Then:

- Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go** on a physical device.

## Debug in VS Code / Cursor

1. Start Metro: `npm run example` (or `cd example && npm start`).
2. Open the app on emulator/device (Expo Go or dev build).
3. Use **Run and Debug** → **Attach to Metro (example)** (port `8081`), or set breakpoints in `example/StreamingDemo.tsx` and use the React Native Tools extension if installed.

Breakpoints in the library resolve to [`../src`](../src) because Metro watches the parent package (`file:..` + `react-native` field → `src/index.ts`).

## Files

| File | Role |
|------|------|
| `App.tsx` | Root component |
| `StreamingDemo.tsx` | Streaming UI under test |
| `metro.config.js` | Monorepo: watch parent `src` |
| `index.js` | Expo entry |
