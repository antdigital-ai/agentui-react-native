export const extractLanguageFromClassName = (
  className: string | string[] | undefined,
): string | undefined => {
  if (!className) return undefined;
  const flat =
    typeof className === 'string' ? className : className.map(String).join(' ');
  const classes = flat.split(/\s+/).filter(Boolean);
  for (const cls of classes) {
    const match = cls.match(/^language-(.+)$/);
    if (match) return match[1];
  }
  return undefined;
};
