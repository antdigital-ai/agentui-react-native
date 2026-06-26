import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import type { MarkdownRemarkPlugin } from './types';

const remarkRehypePlugin = remarkRehype as unknown as Plugin;

export const createHastProcessor = (
  extraRemarkPlugins?: MarkdownRemarkPlugin[],
): Processor => {
  const processor = unified() as Processor & {
    use: (plugin: Plugin, ...args: unknown[]) => Processor;
  };

  (processor as Processor)
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkRehypePlugin as Plugin, { allowDangerousHtml: false } as never);

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
