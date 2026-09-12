import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 衛教文章
 *
 * 檔名就是網址：src/content/articles/20260912-my-post.md
 *   →  https://網站/20260912-my-post
 *
 * 新增一篇文章只要在資料夾裡放一個 .md 檔，首頁卡片、排序、
 * sitemap 都會在下次部署時自動更新。
 */
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      /** 發佈日期。慣例上和檔名前面的 YYYYMMDD 一致 */
      date: z.coerce.date(),
      author: z.string().default('楊怡強 醫師'),
      /** 分類：傷害預防 / 運動傷害 / 體能訓練 / 裝備 / 回歸雪場 */
      category: z.string(),
      tags: z.array(z.string()).default([]),
      /** HERO 圖，放在 src/assets/ 底下 */
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { articles };
