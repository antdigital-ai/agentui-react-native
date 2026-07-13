/**
 * Some providers leak structured tool-call markup into assistant prose
 * (DSML tags, Anthropic-style function_calls XML). Strip before markdown render.
 */

const DSML_TAG_PATTERN = /<\s*\|\s*DSML\s*\|\s*[^>]*>/gi;
const FUNCTION_CALLS_BLOCK_PATTERN = /<function_calls>[\s\S]*?<\/function_calls>/gi;
const DSML_TOOL_CALLS_BLOCK_PATTERN =
  /<\s*\|\s*DSML\s*\|\s*[^>]*\btool_calls\b[^>]*>[\s\S]*?<\s*\|\s*DSML\s*\|\s*[^>]*\/\s*tool_calls\b[^>]*>/gi;

export function containsLeakedModelToolMarkup(text: string): boolean {
  if (!text) {
    return false;
  }
  return (
    /<\s*\|\s*DSML\s*\|/i.test(text)
    || /<function_calls>/i.test(text)
    || /<\s*invoke\s+name=/i.test(text)
  );
}

/** Detect repeated DSML invoke blocks (model stuck re-emitting the same tool call). */
export function detectDsmlToolCallRepetition(text: string): boolean {
  if (!containsLeakedModelToolMarkup(text)) {
    return false;
  }

  const invokeTags = text.match(/<\s*\|\s*DSML\s*\|\s*[^>]*\binvoke\b[^>]*>/gi) ?? [];
  if (invokeTags.length >= 3) {
    const first = invokeTags[0];
    if (invokeTags.filter((tag) => tag === first).length >= 3) {
      return true;
    }
  }

  const toolCallOpenCount = (
    text.match(/<\s*\|\s*DSML\s*\|\s*(?!\/)[^>]*\btool_calls\b[^>]*>/gi) ?? []
  ).length;
  return toolCallOpenCount >= 2;
}

export function stripLeakedModelToolMarkup(content: string): string {
  if (!content || !containsLeakedModelToolMarkup(content)) {
    return content;
  }

  let text = content.replace(FUNCTION_CALLS_BLOCK_PATTERN, '');
  text = text.replace(DSML_TOOL_CALLS_BLOCK_PATTERN, '');
  text = text.replace(DSML_TAG_PATTERN, '');
  text = text.replace(/<\/?invoke\b[^>]*>/gi, '');
  text = text.replace(/<\/?parameter\b[^>]*>/gi, '');

  return text.replace(/\n{3,}/g, '\n\n').trim();
}
