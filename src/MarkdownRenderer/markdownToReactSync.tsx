import React from 'react';
import { createHastProcessor } from './processor';
import { buildRnComponents } from './buildRnComponents';
import { renderMarkdownBlock } from './renderMarkdownBlock';
import { defaultTheme, mergeTheme, type MarkdownThemeOverride } from '../theme/defaultTheme';
import type { MarkdownRemarkPlugin, RendererBlockProps } from './types';

export const markdownToReactSync = (
  content: string,
  components?: Record<string, React.ComponentType<RendererBlockProps>>,
  remarkPlugins?: MarkdownRemarkPlugin[],
  themePartial?: MarkdownThemeOverride,
): React.ReactNode => {
  if (!content) return null;
  const theme = mergeTheme(defaultTheme, themePartial);
  const processor = createHastProcessor(remarkPlugins);
  const bundle = buildRnComponents({
    theme,
    userComponents: components || {},
  });
  return renderMarkdownBlock(content, processor, bundle, theme, {
    isFirstBlock: true,
  });
};
