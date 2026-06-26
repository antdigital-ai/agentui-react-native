import { agenticSpacing } from './agenticTokens';

/** Per-level heading margins from agentic-ui editor content styles. */
export const headingMargins: Record<
  1 | 2 | 3 | 4 | 5 | 6,
  { marginTop: number; marginBottom: number }
> = {
  1: { marginTop: agenticSpacing.margin8x, marginBottom: agenticSpacing.margin8x },
  2: {
    marginTop: agenticSpacing.margin8x,
    marginBottom: agenticSpacing.margin4x,
  },
  3: {
    marginTop: agenticSpacing.margin4x,
    marginBottom: agenticSpacing.margin2x,
  },
  4: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
  5: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
  6: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
};
