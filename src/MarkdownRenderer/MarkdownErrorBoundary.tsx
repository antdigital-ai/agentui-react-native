import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { MarkdownTheme } from '../theme/defaultTheme';

type MarkdownErrorBoundaryProps = {
  content: string;
  bodyStyle: MarkdownTheme['typography']['body'];
  children: ReactNode;
};

type MarkdownErrorBoundaryState = {
  hasError: boolean;
};

export class MarkdownErrorBoundary extends Component<
  MarkdownErrorBoundaryProps,
  MarkdownErrorBoundaryState
> {
  state: MarkdownErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MarkdownErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.warn('[MarkdownRenderer] render error, falling back to plain text', {
        error,
        componentStack: info.componentStack,
      });
    }
  }

  componentDidUpdate(prevProps: MarkdownErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.content !== this.props.content) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { content, bodyStyle } = this.props;
      if (!content.trim()) return null;
      return (
        <View testID="markdown-error-fallback">
          <Text style={bodyStyle}>{content}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
