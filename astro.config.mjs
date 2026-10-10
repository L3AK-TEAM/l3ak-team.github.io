// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeFrames from './src/lib/rehype-frames.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://l3ak.team',
  integrations: [react()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeFrames],
    }),
    // Token colours come from the ANSI palette in global.css, so code is
    // highlighted with the same 16 colours the shell uses.
    shikiConfig: { theme: 'css-variables' },
  },
});
