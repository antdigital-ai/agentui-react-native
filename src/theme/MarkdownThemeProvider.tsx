import React, { createContext, useContext, useMemo } from 'react';
import {
  defaultTheme,
  mergeTheme,
  type MarkdownTheme,
} from './defaultTheme';

const MarkdownThemeContext = createContext<MarkdownTheme>(defaultTheme);

export interface MarkdownThemeProviderProps {
  theme?: Partial<MarkdownTheme>;
  children: React.ReactNode;
}

export function MarkdownThemeProvider({
  theme,
  children,
}: MarkdownThemeProviderProps) {
  const value = useMemo(
    () => mergeTheme(defaultTheme, theme),
    [theme],
  );
  return (
    <MarkdownThemeContext.Provider value={value}>
      {children}
    </MarkdownThemeContext.Provider>
  );
}

export function useMarkdownTheme(): MarkdownTheme {
  return useContext(MarkdownThemeContext);
}

export function useMarkdownThemeWithOverride(
  partial?: Partial<MarkdownTheme>,
): MarkdownTheme {
  const base = useMarkdownTheme();
  return useMemo(() => mergeTheme(base, partial), [base, partial]);
}
