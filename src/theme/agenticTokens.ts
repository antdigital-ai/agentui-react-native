/**
 * Static fallbacks aligned with @ant-design/agentic-ui CSS variables
 * (see agentic-ui `MarkdownEditor/editor/style.ts` and `Bubble/style.ts`).
 */
export const agenticColors = {
  text: 'rgba(20, 22, 28, 0.88)',
  textSecondary: 'rgba(20, 22, 28, 0.65)',
  textMuted: 'rgba(20, 22, 28, 0.45)',
  borderLight: 'rgba(20, 22, 28, 0.06)',
  controlFillSecondary: 'rgba(20, 22, 28, 0.06)',
  codeBackground: 'rgba(20, 22, 28, 0.04)',
  tableHeaderBackground: 'rgba(20, 22, 28, 0.02)',
  primary: '#1677ff',
  userBubbleBackground: '#e6f4ff',
  assistantBubbleBackground: '#ffffff',
  userBubbleCodeBackground: 'rgba(22, 119, 255, 0.12)',
  userBubbleHr: 'rgba(22, 119, 255, 0.35)',
  userBubbleLinkUnderline: 'rgba(22, 119, 255, 0.45)',
  /** Figma 首页 Home — Chat bubbles (`1180:18838`) & chat frame `675:23865` */
  figmaHome: {
    text: '#1e1f1f',
    textCaption: 'rgba(0, 0, 0, 0.27)',
    userBubbleBackground: 'rgba(90, 0, 255, 0.07)',
    userBubbleCodeBackground: 'rgba(90, 0, 255, 0.12)',
    userBubbleHr: 'rgba(90, 0, 255, 0.25)',
    userBubbleLinkUnderline: 'rgba(90, 0, 255, 0.35)',
    userBubbleBorderAccent: '#7c33d7',
    contentWidth: 335,
    horizontalGutter: 20,
    userBubbleMaxWidth: 280,
  },
} as const;

export const agenticSpacing = {
  margin1x: 4,
  margin2x: 8,
  margin4x: 16,
  margin8x: 32,
} as const;
