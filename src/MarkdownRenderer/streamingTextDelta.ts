const PASS_COUNT_PASS = '通过';
const PASS_COUNT_FAIL_SUFFIX = '个失败';
const PASS_COUNT_COMMA = '，';
const PASS_COUNT_COMMA_CLASS = `[${PASS_COUNT_COMMA},]`;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function repairSpacedPassCountFraction(text: string): string {
  const suffixPattern = `(\\s*${escapeRegExp(PASS_COUNT_PASS)})`;
  return text.replace(
    new RegExp(`(\\d(?:\\s+\\d)+)\\/(\\d+)${suffixPattern}`, 'g'),
    (_, digits, total, suffix) => `${digits.replace(/\s+/g, '')}/${total}${suffix}`,
  );
}

function repairOrphanPassCountFraction(text: string): string {
  const pattern = new RegExp(
    `(?<![0-9])\\/(\\d+)\\s*${escapeRegExp(PASS_COUNT_PASS)}${PASS_COUNT_COMMA_CLASS}\\s*(\\d+)(\\s*)${escapeRegExp(PASS_COUNT_FAIL_SUFFIX)}`,
    'g',
  );
  return text.replace(pattern, (_, total, failed, failSuffixSpace) => {
    const passed = Number(total) - Number(failed);
    return `${passed}/${total} ${PASS_COUNT_PASS}${PASS_COUNT_COMMA}${failed}${failSuffixSpace}${PASS_COUNT_FAIL_SUFFIX}`;
  });
}

/**
 * Safe post-stream repairs for thinking text: pass-count fractions and CJK/Latin spacing.
 * Does not guess English word boundaries (avoids corrupting camelCase).
 */
export function repairStreamingEnglishGlue(text: string): string {
  if (!text) {
    return text;
  }

  let result = text;
  result = repairSpacedPassCountFraction(result);
  result = repairOrphanPassCountFraction(result);
  result = result.replace(/([A-Za-z0-9]{2,})([\u4e00-\u9fff])/g, '$1 $2');
  result = result.replace(/([\u4e00-\u9fff])([A-Za-z0-9]{2,})/g, '$1 $2');

  return result;
}
