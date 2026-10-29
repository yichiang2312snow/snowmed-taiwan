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
| 工具卡片排序 | HTML 先照 `src/consts.ts` 的順序，載入後依近 30 天使用次數重排（`src/components/ToolGrid.astro`） |
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

---

## 許願留言區的審核

網友送出的許願**一律進入待審**，不會自動公開。審核用的是一個 Bearer token，存在 Cloudflare Pages 的 Secret 裡（變數名稱 `WISH_ADMIN_TOKEN`）。

看待審清單：

```bash
curl -H "Authorization: Bearer <你的TOKEN>" https://snowmed-taiwan.com/api/wishes/admin
```

通過、退回或刪除某一則（`id` 從上面的清單取得）：

```bash
curl -X POST https://snowmed-taiwan.com/api/wishes/admin \
  -H "Authorization: Bearer <你的TOKEN>" \
  -H "content-type: application/json" \
  -d '{"id":"<許願ID>","action":"approve"}'
```

`action` 可以是 `approve`（公開）、`reject`（不公開但保留）、`delete`（永久刪除）。
加上 `"reply":"你的回覆"` 可以在公開的許願下面附上平台回覆。

要換 token：
```bash
npx wrangler pages secret put WISH_ADMIN_TOKEN --project-name snowmed-taiwan
```

### 隱私設計
- 不收集 email，暱稱可留空
- 送出者的 IP **只存雜湊值**（做防灌水用），不存原文
- 公開的 API 回應完全不含審核欄位與來源雜湊

---

## 雪場即時狀況回饋單的管理

`/tools/snow-report` 的回報跟許願區相反，**送出後立刻公開、不經審核** ——
今天結冰的跳台如果等到審完才出現就沒有意義了。擋灌水靠蜜罐欄位、每小時上限（同一來源 5 則）與字數限制，
不實或不當的內容則是事後刪除。

### 照片審核

有附照片的回報，**文字立刻公開，照片要核准才會出現**。文字有時效、要快；照片是最容易出事的地方
（拍到當事人、血腥畫面、廣告），值得先看過。

審核有畫面：**<https://snowmed-taiwan.com/admin/reports>**
貼上管理 token 按「載入」，就會看到待審照片、可以直接核准、退回照片（文字留著）或刪掉整則，
下面另外列出目前公開的全部回報，也可以從那裡刪。
這一頁 noindex、不進 sitemap，robots.txt 也擋掉 `/admin/`；token 只存在你當下那個分頁。

照片在使用者的瀏覽器就先縮到長邊 1600 px 的 JPEG 再上傳（順便把含 GPS 的 EXIF 丟掉），
存在 KV 的 `rptimg:<回報ID>`，保留 180 天。

看目前公開的回報（以及待審清單）：

```bash
curl -H "Authorization: Bearer <你的TOKEN>" https://snowmed-taiwan.com/api/reports/admin
```

核准照片、退回照片或刪掉整則（`id` 從上面的清單取得）：

```bash
curl -X POST https://snowmed-taiwan.com/api/reports/admin \
  -H "Authorization: Bearer <你的TOKEN>" \
  -H "content-type: application/json" \
  -d '{"id":"<回報ID>","action":"approve-photo"}'
```

`action` 可以是 `approve-photo`（公開照片）、`reject-photo`（只刪照片，文字留著）、`delete`（整則刪除）。

Token 用 `REPORT_ADMIN_TOKEN`；沒設定的話會沿用許願區的 `WISH_ADMIN_TOKEN`，兩個都沒有就回 503（不會有預設密碼）。

```bash
npx wrangler pages secret put REPORT_ADMIN_TOKEN --project-name snowmed-taiwan
```

頁面顯示最近 80 則（`rpt:feed`），單筆另存一份 180 天（`rpt:i:*`）。
為了不把免費方案的 KV `list()` 額度用掉，前台讀的是算好的那份清單，只有你手動刪除時才會用到 `list()`。

## 雪場醫療資料的維護規則

`src/data/resorts.ts` 裡的每一筆地址與電話，**必須附上 `source` 官方來源連結和 `checkedAt` 查證日期**。
不確定的資訊寧可不放。使用者可能在受傷、著急、語言不通的狀況下依賴這份資料。

---

## 台灣醫療決策者體驗（醫療政策模擬遊戲）

遊戲的**畫面在楊醫師的個人網站**：入口 <https://dr.snowmed-taiwan.com/game>、投影計分板 `/game/board`、
主持人台在個人網站的後台 `/admin/game`（登入儀表板就能用）。這裡（工具站）只放**資料與 AI 評分的 API**，
舊的 `/game` 連結會自動轉到個人網站（`public/_redirects`）。

| 項目 | 位置 |
| --- | --- |
| 二十張事件卡（情境、三個參考方向、典故、評分提示、預算換算） | `src/data/policyGameCards.ts`（審核用的可讀版：`docs/醫療決策遊戲-事件卡審核.md`） |
| 資源名稱、起始分數、字數上限、組數上限、特殊規則說明文字 | `src/data/policyGameResources.ts`（個人網站有一份相同的複本） |
| 八條特殊規則的計算 | `functions/api/game/_rules.js` |
| 後端 API | `functions/api/game/`（`host.js` 主持人、`join.js` 加入、`state.js` 讀狀態、`submit.js` 交政策、`_scorer.js` AI 評分、`_middleware.js` 放行個人網站的跨站請求） |
| 資料庫 | Cloudflare D1 `snowmed-game`，資料表在 `db/game-schema.sql` |

### 第一次上線前要做的事

1. **設定主持人金鑰**（這裡和個人網站的 Vercel 要設同一組）：
   ```bash
   npx wrangler pages secret put GAME_HOST_TOKEN --project-name snowmed-taiwan
   ```
   沒設的話會沿用 `WISH_ADMIN_TOKEN`（個人網站那邊對應 `SNOWMED_ADMIN_TOKEN`，兩邊本來就相同，所以不設也能用）。
2. **設定 Anthropic API 金鑰**（AI 評分用，從 <https://platform.claude.com> 取得）：
   ```bash
   npx wrangler pages secret put ANTHROPIC_API_KEY --project-name snowmed-taiwan
   ```
   沒設的話評分會失敗，但主持人仍可用「手動評分」把遊戲玩完。
3. 資料表已經建好；如果日後改了 `db/game-schema.sql`，重跑：
   ```bash
   npx wrangler d1 execute snowmed-game --remote --file db/game-schema.sql
   ```

### 上課流程

1. 登入個人網站後台 → 儀表板 → 「🎲 開啟醫療決策遊戲」→ 設定本回合入場密碼（4～12 個英數字）與每回合討論幾分鐘 → 「開啟遊戲大廳」。
2. 把 `dr.snowmed-taiwan.com/game/board` 投影出來。各組組長到 `dr.snowmed-taiwan.com/game` 輸入入場密碼和組名加入（最多 10 組）。
3. 按「開始第 1 回合」（可指定事件卡，預設隨機抽沒用過的）。各組看到情境、預算換算、三個參考方向與倒數，寫 80 字內的政策送出；你在主持人台可以即時看到每組寫了什麼，也可以延長時間。
4. 按「AI 評分」：沒交的組會被當成「沒有決策」扣分；AI 一次評完全部組別（約 30 秒～1 分鐘，請不要關閉分頁），之後各組看到加減分、觸發的特殊規則、解釋與歷史典故。
5. 重複 3～4，想停就按「結束遊戲」結算名次。AI 失敗或你覺得分數不合理，用主持人台下方的「手動評分」改。

分數不是存起來的，而是「起始 60 分 + 每回合加減分 + 特殊規則效果」算出來的，所以重新評分、手動改分都不會把分數弄壞。
AI 依 ±20 的基準評分，系統乘 1.5 倍後，每項資源每回合封頂 ±10；亂答或沒交固定扣 預算-8／護理-8／醫師-8／選票-10／健康-10。
每張卡有「預算換算」（例如 1 分 = 1 億元）：政策寫明花多少錢就照換算扣預算，寫明每年多收多少就照換算加預算。

### 八條特殊規則（每回合政策分數套用後自動觸發，畫面會提醒玩家與主持人）

「連續兩回合」看的是政策本身的加減分（AI 或主持人給的），不含規則效果。

1. 預算提撥：每回合預算 +5。
2. 醫療環境惡性循環：回合結束時醫師奉獻度 < 45 → 護理人力 −5；護理人力 < 45 → 醫師奉獻度 −5（每回合累計）。
3. 民心化成預算：選票與民眾健康連續兩回合都加分 → 預算 +（兩回合選票加分 + 兩回合健康加分）÷ 2。
4. 選舉失利：選票連續兩回合被扣分 → 接下來那一回合預算最多只能動用 5 分。
5. 走向醫療崩壞：民眾健康連續兩回合被扣分 → 五項全部 −3（每回合累計）。
6. 七大皆空：醫師奉獻度連續兩回合被扣分 → 民眾健康 −5（每回合累計）。
7. 醫療外的生活品質：回合結束時預算 < 50 → 選票 −2；< 40 → 選票 −4（每回合累計）。
8. 沒護理師導致關閉病房開刀房：護理人力連續兩回合被扣分 → 醫師奉獻度 −3、民眾健康 −3、選票 −3（每回合累計）。

分數不是存起來的，而是「起始 60 分 + 每回合加減分 + 特殊規則效果」算出來的，所以重新評分、手動改分都不會把分數弄壞。
AI 依 ±20 的基準評分，系統乘 1.5 倍後，每項資源每回合封頂 ±10；亂答或沒交固定扣 預算-8／護理-8／醫師-8／選票-10／健康-10。
每張卡有「預算換算」（例如 1 分 = 1 億元）：政策寫明花多少錢就照換算扣預算，寫明每年多收多少就照換算加預算。

### 本機測試

```bash
npm run build
npx wrangler pages dev        # API 在 http://127.0.0.1:8788，用本機 D1；.dev.vars 的 GAME_MOCK_AI=1 可以不用 API 金鑰跑完流程
```
個人網站那邊把 `.env` 的 `PUBLIC_GAME_API`、`GAME_HOST_TOKEN`、`ADMIN_DEV_BYPASS` 三行打開，`npm run dev` 後就能在本機跑完整流程。
