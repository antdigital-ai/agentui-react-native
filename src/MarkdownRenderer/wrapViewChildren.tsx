import React from 'react';
import { Text, type TextStyle } from 'react-native';

type WrapViewChildrenOptions = {
  mapElement?: (element: React.ReactElement) => React.ReactElement;
};

/** RN requires text nodes under `<Text>`, not bare strings in `<View>`. */
export function wrapViewChildren(
  children: React.ReactNode,
  textStyle: TextStyle,
  options?: WrapViewChildrenOptions,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (child == null || typeof child === 'boolean') return null;
    if (typeof child === 'string' || typeof child === 'number') {
      const value = String(child);
      if (value.length === 0) return null;
      return <Text style={textStyle}>{value}</Text>;
    }
    if (React.isValidElement(child)) {
      return options?.mapElement ? options.mapElement(child) : child;
    }
    return <Text style={textStyle}>{String(child)}</Text>;
  });
}
