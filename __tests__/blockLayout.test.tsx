import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { markdownToReactSync } from '../src/MarkdownRenderer/markdownToReactSync';
import { withBlockLayout, useBlockLayout } from '../src/MarkdownRenderer/blockLayout';

function LayoutProbe() {
  const layout = useBlockLayout();
  return (
    <Text testID="layout-probe">
      {layout.isFirstBlockInDocument ? 'first' : 'rest'}:{layout.paragraphIndex}
    </Text>
  );
}

describe('blockLayout', () => {
  it('withBlockLayout supplies isFirstBlockInDocument to descendants', () => {
    const { getByTestId } = render(
      withBlockLayout(true, <LayoutProbe />) as React.ReactElement,
    );
    expect(getByTestId('layout-probe').props.children).toEqual(['first', ':', 0]);
  });

  it('markdownToReactSync wraps content with block layout context', () => {
    expect(() => markdownToReactSync('Plain paragraph')).not.toThrow();
  });
});
