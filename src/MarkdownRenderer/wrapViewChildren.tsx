import React, { Fragment } from 'react';
import { Text, type TextStyle } from 'react-native';

type WrapViewChildrenOptions = {
  mapElement?: (element: React.ReactElement) => React.ReactElement;
};

/** Flatten Fragment wrappers so View parents never receive bare strings via Fragment. */
export function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (React.isValidElement(child) && child.type === Fragment) {
      out.push(
        ...flattenChildren(
          (child as React.ReactElement<{ children?: React.ReactNode }>).props
            .children,
        ),
      );
      return;
    }
    out.push(child);
  });
  return out;
}

/** RN requires text nodes under `<Text>`, not bare strings in `<View>`. */
export function wrapViewChildren(
  children: React.ReactNode,
  textStyle: TextStyle,
  options?: WrapViewChildrenOptions,
): React.ReactNode {
  return flattenChildren(children).map((child, index) => {
    if (child == null || typeof child === 'boolean') return null;
    if (typeof child === 'string' || typeof child === 'number') {
      const value = String(child);
      if (value.length === 0) return null;
      return (
        <Text key={`t-${index}`} style={textStyle}>
          {value}
        </Text>
      );
    }
    if (React.isValidElement(child)) {
      const mapped = options?.mapElement ? options.mapElement(child) : child;
      return React.isValidElement(mapped)
        ? React.cloneElement(mapped, { key: mapped.key ?? `n-${index}` })
        : mapped;
    }
    return (
      <Text key={`t-${index}`} style={textStyle}>
        {String(child)}
      </Text>
    );
  });
}

/** Inline markdown host (`<Text>`): flatten Fragment, keep strings as direct Text children. */
export function wrapInlineChildren(children: React.ReactNode): React.ReactNode {
  return flattenChildren(children)
    .map((child, index) => {
      if (child == null || typeof child === 'boolean') return null;
      if (typeof child === 'string' || typeof child === 'number') {
        const value = String(child);
        return value.length === 0 ? null : value;
      }
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { key: child.key ?? `i-${index}` });
      }
      return String(child);
    })
    .filter((child) => child != null && child !== '');
}
