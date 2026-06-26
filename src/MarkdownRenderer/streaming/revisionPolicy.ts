export const shouldResetRevisionProgress = (
  previous: string | undefined,
  next: string,
): boolean => {
  if (previous === undefined || previous === '') return false;
  if (next === previous) return false;
  if (next.startsWith(previous)) return false;
  if (previous.startsWith(next)) return false;
  return true;
};
