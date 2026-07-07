/**
 * Progressive block reveal was only active for non-streaming long messages (>12 blocks),
 * which breaks Android FlatList layout (invisible content + blank scroll area).
 * Render all blocks immediately; keep hook for API stability.
 */
export function useProgressiveBlocks(totalBlocks: number): number {
  return totalBlocks;
}
