import { Platform } from 'react-native';

/** System stacks — comfortable / desktop markdown. */
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

/**
 * Figma `typography/font-family/text` → Mona Sans (Medium 500 / SemiBold 600 / Bold 700).
 * Web: load Mona Sans in app CSS (see example/global.css). Native: register with expo-font.
 */
export const figmaHomeFontFamily = Platform.select({
  web: {
    fontFamily:
      "'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  ios: {
    fontFamily: 'Mona Sans',
  },
  android: {
    fontFamily: 'sans-serif-medium',
  },
  default: {},
});

export const figmaHomeCodeFontFamily = Platform.select({
  web: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
  default: { fontFamily: 'monospace' },
});
