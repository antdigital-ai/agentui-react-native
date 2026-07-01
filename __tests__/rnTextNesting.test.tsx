import React from 'react';
import { render } from '@testing-library/react-native';
import { MarkdownRenderer } from '../src/MarkdownRenderer/MarkdownRenderer';
import { MessageList } from '../src/MessageList/MessageList';
import { markdownToReactSync } from '../src/MarkdownRenderer/markdownToReactSync';
import { MarkdownThemeProvider } from '../src/theme/MarkdownThemeProvider';
import { compactMarkdownTheme } from '../src/theme/mobileTheme';
import type { ChatMessage } from '../src/MessageList/types';
import {
  FIGMA_HOME_ASSISTANT_MARKDOWN,
  FIGMA_HOME_THINKING_BODY,
  FIGMA_HOME_USER_MESSAGE,
} from '../example/figmaHomeDemoContent';

type JsonTree = {
  type?: string;
  children?: Array<string | JsonTree | null>;
};

const VIEW_TYPES = new Set(['View', 'ScrollView', 'Pressable']);

function findBareStringsInViews(node: JsonTree | string | null, path = 'root'): string[] {
  if (node == null || typeof node === 'string') return [];
  const violations: string[] = [];
  if (node.type && VIEW_TYPES.has(node.type)) {
    for (let i = 0; i < (node.children?.length ?? 0); i += 1) {
      const child = node.children?.[i];
      if (typeof child === 'string' && child.trim().length > 0) {
        violations.push(`${path}[${i}] bare string: ${JSON.stringify(child)}`);
      }
    }
  }
  for (let i = 0; i < (node.children?.length ?? 0); i += 1) {
    const child = node.children?.[i];
    if (child != null && typeof child !== 'string') {
      violations.push(...findBareStringsInViews(child, `${path}/${node.type}[${i}]`));
    }
  }
  return violations;
}

describe('RN text nesting guards', () => {
  const markdownSamples = [
    ['figma home sync', FIGMA_HOME_ASSISTANT_MARKDOWN],
    ['inline link paragraph', 'Official website: [https://arbitrum.io/](https://arbitrum.io/)'],
    ['font in list', '- 24h Change: <font color="#FF5B5B">+3.2%</font>'],
    ['table', '| header | value |\n| --- | --- |\n| 24H Volume | $456.20 M |'],
    ['bold stat line', '**72,732.45** · <font color="#FF5B5B">-2.63%</font>'],
  ] as const;

  it.each(markdownSamples)('sync markdown has no bare strings in View (%s)', (_label, content) => {
    const tree = render(
      <>{markdownToReactSync(content, undefined, undefined, compactMarkdownTheme)}</>,
    ).toJSON() as JsonTree;
    expect(findBareStringsInViews(tree)).toEqual([]);
  });

  it('MarkdownRenderer progressive output has no bare strings in View', () => {
    const tree = render(
      <MarkdownThemeProvider>
        <MarkdownRenderer
          layoutDensity="compact"
          content={FIGMA_HOME_ASSISTANT_MARKDOWN}
          throttleOptions={{ enabled: false }}
        />
      </MarkdownThemeProvider>,
    ).toJSON() as JsonTree;
    expect(findBareStringsInViews(tree)).toEqual([]);
  });

  it('MessageList figma thread has no bare strings in View', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: FIGMA_HOME_USER_MESSAGE },
      {
        id: '2',
        role: 'assistant',
        content: FIGMA_HOME_ASSISTANT_MARKDOWN,
        isFinished: true,
        thinking: {
          status: 'completed',
          body: FIGMA_HOME_THINKING_BODY,
          defaultExpanded: true,
        },
      },
    ];
    const tree = render(
      <MarkdownThemeProvider>
        <MessageList messages={messages} layoutDensity="compact" />
      </MarkdownThemeProvider>,
    ).toJSON() as JsonTree;
    expect(findBareStringsInViews(tree)).toEqual([]);
  });
});
