import React from 'react';
import { Text } from 'react-native';
import { wrapViewChildren } from '../src/MarkdownRenderer/wrapViewChildren';

describe('wrapViewChildren', () => {
  const style = { fontSize: 14 };

  it('wraps raw strings in Text', () => {
    const out = wrapViewChildren('hello', style);
    expect(Array.isArray(out)).toBe(true);
    const node = (out as React.ReactElement[])[0];
    expect(node.type).toBe(Text);
    expect((node.props as { children: string }).children).toBe('hello');
  });

  it('passes through valid elements', () => {
    const el = <Text testID="keep">x</Text>;
    const out = wrapViewChildren(el, style);
    expect((out as React.ReactElement<{ testID?: string }>[])[0].props.testID).toBe(
      'keep',
    );
  });

  it('maps elements when mapElement is provided', () => {
    const el = <Text testID="child">x</Text>;
    const out = wrapViewChildren(el, style, {
      mapElement: (node) =>
        React.cloneElement(node as React.ReactElement<{ testID?: string }>, {
          testID: 'mapped',
        }),
    });
    expect((out as React.ReactElement<{ testID?: string }>[])[0].props.testID).toBe(
      'mapped',
    );
  });
});
