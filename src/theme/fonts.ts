import { Platform } from 'react-native';

/** System stacks so Web matches native chat typography (agentic-ui / Ant Design–like). */
export const fontFamilies = {
  body: Platform.select({
    web: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    },
    default: {},
  }),
  code: Platform.select({
    web: {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    default: { fontFamily: 'monospace' },
  }),
};
