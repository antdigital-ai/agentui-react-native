import {
  remarkGfm,
  remarkParse,
  remarkRehype,
  unified,
  type Plugin,
  type Processor,
} from './remarkBundle';
import { rehypeFontFromRaw } from './rehypeFontFromRaw';
import type { MarkdownRemarkPlugin } from './types';

const remarkRehypePlugin = remarkRehype as unknown as Plugin;
const rehypeFontPlugin = rehypeFontFromRaw as unknown as Plugin;

export const createHastProcessor = (
  extraRemarkPlugins?: MarkdownRemarkPlugin[],
): Processor => {
  const processor = unified() as Processor & {
    use: (plugin: Plugin, ...args: unknown[]) => Processor;
  };

  (processor as Processor)
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkRehypePlugin as Plugin, { allowDangerousHtml: true } as never)
    .use(rehypeFontPlugin);

  if (extraRemarkPlugins?.length) {
    extraRemarkPlugins.forEach((entry) => {
      if (Array.isArray(entry)) {
        const [plugin, ...pluginOptions] = entry;
        processor.use(plugin, ...pluginOptions);
      } else {
        processor.use(entry);
      }
    });
  }

  return processor;
};
