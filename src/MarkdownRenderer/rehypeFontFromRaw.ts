import type { Plugin } from './remarkBundle';
import { visit } from './remarkBundle';

type HastParent = { children: unknown[] };
type HastElement = {
  type: 'element';
  tagName: string;
  properties: Record<string, string>;
  children: { type: 'text'; value: string }[];
};
type HastText = { type: 'text'; value: string };
type HastChild = HastText | HastElement;

const FONT_TAG_INLINE = /<font\s+([^>]*?)>([\s\S]*?)<\/font\s*>/gi;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    attrs[key] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}

function toFontElement(attrString: string, inner: string): HastElement {
  const attrs = parseAttributes(attrString);
  const properties: Record<string, string> = {};
  if (attrs.color) properties.color = attrs.color;
  if (attrs.size) properties.size = attrs.size;
  const children: HastText[] = [{ type: 'text', value: inner }];
  return {
    type: 'element',
    tagName: 'font',
    properties,
    children,
  };
}

/** Split strings into text + `<font>` hast nodes. */
function expandFontTags(value: string): HastChild[] | null {
  if (!/<font\s/i.test(value)) return null;
  const out: HastChild[] = [];
  let last = 0;
  FONT_TAG_INLINE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FONT_TAG_INLINE.exec(value)) !== null) {
    if (match.index > last) {
      out.push({ type: 'text', value: value.slice(last, match.index) });
    }
    out.push(toFontElement(match[1], match[2]));
    last = match.index + match[0].length;
  }
  if (last < value.length) {
    out.push({ type: 'text', value: value.slice(last) });
  }
  return out.length > 0 ? out : null;
}

function isInlineStringNode(
  node: unknown,
): node is { type: 'text' | 'raw'; value: string } {
  if (typeof node !== 'object' || node == null || !('type' in node)) {
    return false;
  }
  const type = (node as { type: string }).type;
  return (type === 'text' || type === 'raw') && 'value' in node;
}

/** Merge adjacent text/raw (incl. entity-encoded HTML) and expand `<font>` tags. */
function coalesceFontInChildren(parentEl: HastParent): void {
  const { children } = parentEl;
  let i = 0;
  while (i < children.length) {
    if (!isInlineStringNode(children[i])) {
      i += 1;
      continue;
    }
    let j = i;
    let combined = '';
    while (j < children.length && isInlineStringNode(children[j])) {
      combined += decodeHtmlEntities(
        (children[j] as { value: string }).value,
      );
      j += 1;
    }
    const expanded = expandFontTags(combined);
    if (expanded) {
      children.splice(i, j - i, ...expanded);
      i += expanded.length;
      continue;
    }
    if (j > i + 1) {
      children.splice(i, j - i, { type: 'text', value: combined });
      i += 1;
      continue;
    }
    if (combined !== (children[i] as HastText).value) {
      children[i] = { type: 'text', value: combined };
    }
    i += 1;
  }
}

/** Turn safe inline `<font color size>` raw HTML into hast elements; drop other raw HTML. */
export const rehypeFontFromRaw: Plugin<[], import('unist').Node> = () => (tree) => {
  visit(tree, 'element', (node) => {
    if (!node || typeof node !== 'object' || !('children' in node)) return;
    coalesceFontInChildren(node as HastParent);
  });

  visit(tree, 'raw', (node, index, parent) => {
    if (index == null || !parent || !('children' in parent)) return;
    const parentEl = parent as HastParent;
    const trimmed = decodeHtmlEntities((node as { value: string }).value.trim());
    const expanded = expandFontTags(trimmed);
    if (expanded) {
      parentEl.children.splice(index, 1, ...expanded);
      return;
    }
    if (/<[a-z!/]/i.test(trimmed)) {
      parentEl.children[index] = {
        type: 'text',
        value: stripHtmlTags(trimmed),
      };
    }
  });
};
