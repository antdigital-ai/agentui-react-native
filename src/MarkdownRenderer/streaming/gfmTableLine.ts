const GFM_TABLE_ROW_PATTERN = /^\s*\|(.+\|)+\s*$/;
const GFM_TABLE_SEPARATOR_PATTERN = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;

export const isGfmTableLine = (line: string): boolean =>
  GFM_TABLE_ROW_PATTERN.test(line) || GFM_TABLE_SEPARATOR_PATTERN.test(line);

export const endsInsideGfmTable = (source: string): boolean => {
  const lines = source.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line === '') continue;
    return isGfmTableLine(line);
  }
  return false;
};
