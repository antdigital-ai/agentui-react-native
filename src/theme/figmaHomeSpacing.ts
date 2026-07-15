/** Figma 首页 Home chat `675:23865` spacing tokens */
export const figmaHomeSpacing = {
  chatPaddingTop: 20,
  chatPaddingBottom: 24,
  chatPaddingHorizontal: 20,
  /** Between chat rows / result blocks */
  messageGap: 16,
  /** Major blocks inside assistant reply (e.g. intro → sections stack) */
  contentBlockGap: 20,
  /**
   * Markdown `---` divider — Figma Home `901:20534`
   * (agentic-ui MarkdownRenderer `--margin-8x` = 20px; full content width, no side inset).
   */
  hrMarginVertical: 20,
  /** Between section blocks (`What it is`, trend, holding) */
  sectionGap: 24,
  /** Section title → body (`gap/区块内/base`) */
  inSectionTitleGap: 12,
  /** List rows, suggestion chips */
  listItemGap: 12,
  /** Nested list / bullet gutter */
  listNestedIndent: 20,
  /** Follow-up block: chips → disclaimer */
  footerBlockGap: 16,
  /** Stat card inner padding */
  cardPadding: 16,
} as const;
