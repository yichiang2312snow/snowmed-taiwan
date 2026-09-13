// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 工具頁的更新日期寫在 consts.ts 的 TOOLS 裡，sitemap 直接沿用，
// 搜尋引擎才知道哪些頁面真的有改過、值得重抓。
import { TOOLS } from './src/consts.ts';
const lastmod = new Map(TOOLS.map((t) => [t.href, t.updated]));

export default defineConfig({
  site: 'https://snowmed-taiwan.com',
  integrations: [
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '');
        const date = lastmod.get(path);
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
