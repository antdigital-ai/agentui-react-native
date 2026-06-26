export const DANGEROUS_EVENT_HANDLER_PATTERN = /\bon\w+\s*=/i;
export const DANGEROUS_URL_SCHEMES = ['javascript:', 'vbscript:'] as const;

const HTML_SNIPPET_PATTERN = /<\s*\/?\s*[a-z][\w-]*[^>]*>/i;

export const hasDangerousEventHandlers = (value: string): boolean =>
  DANGEROUS_EVENT_HANDLER_PATTERN.test(value);

export const hasDangerousUrlScheme = (value: string): boolean => {
  const lower = value.toLowerCase().trimStart();
  return DANGEROUS_URL_SCHEMES.some((scheme) => lower.startsWith(scheme));
};

export const looksLikeHtmlSnippet = (value: string): boolean =>
  HTML_SNIPPET_PATTERN.test(value.trim());

export const shouldRenderUrlAsPlainText = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (hasDangerousEventHandlers(trimmed)) return true;
  if (hasDangerousUrlScheme(trimmed)) return true;
  if (looksLikeHtmlSnippet(trimmed)) return true;
  return false;
};
