# SnowMed Taiwan

**楊怡強醫師 — 台灣第一位專攻滑雪運動醫學的醫師**
Dr. Yi-Chiang Yang — Taiwan's first physician specializing in ski & snowsports medicine.

滑雪運動醫學衛教部落格。以 [Astro](https://astro.build) + Tailwind CSS 建置，
部署在 Cloudflare Pages，推送到 `main` 就會自動上線。

---

## 怎麼新增一篇文章

1. 在 `src/content/articles/` 新增一個 Markdown 檔
2. 檔名格式：`YYYYMMDD-英文短網址.md`，例如 `20261001-knee-brace.md`
   → 網址就會是 `https://網站/20261001-knee-brace`
3. 檔案開頭放這段設定（frontmatter）：

```markdown
---
title: 文章標題
description: 一到兩句話的摘要，會顯示在卡片和搜尋結果
date: 2026-10-01
author: 楊怡強 醫師
category: 運動傷害        # 觀點 / 運動傷害 / 體能訓練 / 回歸雪場 / 裝備
tags: [護膝, 膝關節]
heroImage: ../../assets/article-downhill.jpg   # 可省略
heroAlt: 圖片的文字說明（給視障讀者和搜尋引擎看）
draft: false              # 設 true 就不會發佈
---

正文從這裡開始……
```

4. `git commit` 然後 `git push`，Cloudflare Pages 會自動重新建置上線

首頁的文章卡片、排序、sitemap 都會自動更新，**不需要手動改任何清單**。

### 寫作小提醒

中文的粗體語法在**全形標點後面會失效**，例如 `**拇指（UCL）**大概` 不會變粗體。
把括號移到粗體外面即可：`**拇指**（UCL）大概`。

---

## 網站怎麼運作

| 項目 | 做法 |
| --- | --- |
| 文章網址 | 檔名即網址，`20260903-skiers-thumb.md` → `/20260903-skiers-thumb` |
| 首頁文章列表 | 建置時直接寫進 HTML（不是 JavaScript 讀 JSON），對 SEO 友善 |
| 卡片排序 | 依「發佈日期」與「最後更新時間」取較晚者，新的在最前面 |
| 最後更新時間 | 建置時自動讀取該檔案的 git commit 時間，改完推上去就會更新 |
| 瀏覽計數器 | Cloudflare Pages Functions + KV（`functions/api/views/`），不需第三方服務、不需 API 金鑰 |
| 圖片 | 放 `src/assets/`，Astro 會自動產生多種尺寸的 WebP |
| 圖片授權 | 全部使用 CC BY 授權照片，出處列在 `src/consts.ts` 的 `IMAGE_CREDITS`，會自動顯示在頁尾 |

## 要改網站設定

- **網站名稱、標語、聯絡方式**：`src/consts.ts`
- **選單項目**：`src/consts.ts` 的 `NAV`
- **配色與字型**：`src/styles/global.css` 最上面的 `@theme` 區塊
- **網域**：`astro.config.mjs` 的 `site`

## 本機開發

```bash
npm install
npm run dev        # 一般開發（沒有瀏覽計數器）
npm run build      # 產生靜態檔到 dist/
npx wrangler pages dev   # 完整模擬 Cloudflare，含瀏覽計數器
```

## 待補內容

- `src/pages/about.astro` 的學經歷、專科證照、滑雪資歷
- `src/consts.ts` 的 email、LINE、社群連結、看診院所與時段
