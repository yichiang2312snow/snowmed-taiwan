/**
 * 每個工具對應到楊醫師個人網站上的哪幾篇文章
 *
 * 為什麼要有這個：工具容易被搜尋到（它們本來就是為了解決具體問題做的），
 * 但工具頁的文字少，說不清楚「為什麼」。文章把道理講完整，卻比較難被搜到。
 * 把兩邊接起來，進來用工具的人就有機會讀到背後的依據，
 * 兩個網域也才不會各自累積、互相浪費。
 *
 * 新增文章後請一併更新這裡。slug 要跟個人網站上的一致，
 * 連錯會變成 404 —— 改完請實際點一次。
 */

export interface RelatedArticle {
  /** 個人網站的文章 slug */
  slug: string;
  title: string;
  /** 為什麼這篇跟這個工具有關，一句話，讓人知道值不值得點 */
  why: string;
}

/** key 是工具的路徑（跟 consts.ts 的 TOOLS.href 一致） */
export const RELATED_ARTICLES: Record<string, RelatedArticle[]> = {
  '/tools/helmet-check': [
    {
      slug: 'snow-helmet-ratings-virginia-tech',
      title: '滑雪安全帽怎麼挑？美國維吉尼亞理工「頭盔實驗室」的 48 頂測試告訴你',
      why: '這個工具的題目就是從這篇整理出來的，想看完整數據與測試方法請讀這篇。',
    },
  ],

  '/tools/concussion': [
    {
      slug: '20260925',
      title: '沒昏倒也會腦震盪？從名古屋亞運滑板選手摔傷看腦震盪',
      why: '用一個真實案例說明為什麼「沒昏倒」不代表沒有腦震盪。',
    },
    {
      slug: 'snow-helmet-ratings-virginia-tech',
      title: '滑雪安全帽怎麼挑？48 頂測試告訴你',
      why: '安全帽能降低多少頭部傷害、又擋不住什麼。',
    },
  ],

  '/tools/injury-triage': [
    {
      slug: 'ski-ankle-injury',
      title: '滑雪腳踝會受傷嗎？單板與雙板腳踝傷害大不同',
      why: '單板跌倒後的腳踝痛，有一種骨折很容易被當成扭傷。',
    },
    {
      slug: 'acl-ski-injury-part1',
      title: '前十字韌帶，滑雪容易受傷嗎？',
      why: '膝蓋受傷時最需要先排除的就是前十字韌帶。',
    },
  ],

  '/tools/xray-check': [
    {
      slug: 'ski-ankle-injury',
      title: '滑雪腳踝會受傷嗎？單板與雙板腳踝傷害大不同',
      why: '為什麼有些腳踝骨折連 X 光都照不出來。',
    },
  ],

  '/tools/return-to-snow': [
    {
      slug: 'acl-ski-injury-part2',
      title: '前十字韌帶受傷後該怎麼辦？開刀或不開刀？',
      why: '決定要不要開刀，以及開完刀之後的復原路徑。',
    },
    {
      slug: 'acl-ski-injury-part1',
      title: '前十字韌帶，滑雪容易受傷嗎？',
      why: '先了解它是怎麼受傷的，才知道回場要練什麼。',
    },
  ],

  '/tools/fitness-check': [
    {
      slug: 'ski-intro-20260930',
      title: '第一次滑雪要知道的事：單雙板差別、雪場怎麼挑、行前裝備與醫師的提醒',
      why: '體能只是其中一環，這篇把出發前該準備的全部串起來。',
    },
  ],

  '/tools/training-plan': [
    {
      slug: 'ski-intro-20260930',
      title: '第一次滑雪要知道的事：單雙板差別、雪場怎麼挑、行前裝備與醫師的提醒',
      why: '為什麼滑雪特別需要練下肢離心肌力與平衡。',
    },
    {
      slug: 'post-mp8nu8vj',
      title: '滑雪 vs 衝浪：動作上有何差異呢？',
      why: '兩種板類運動用到的肌群不同，訓練的重點也不一樣。',
    },
  ],

  '/tools/pre-trip-checklist': [
    {
      slug: 'ski-intro-20260930',
      title: '第一次滑雪要知道的事：單雙板差別、雪場怎麼挑、行前裝備與醫師的提醒',
      why: '清單上每一項的「為什麼」都在這篇裡。',
    },
  ],

  '/tools/japan-resorts': [
    {
      slug: 'ski-intro-20260930',
      title: '第一次滑雪要知道的事：單雙板差別、雪場怎麼挑、行前裝備與醫師的提醒',
      why: '挑雪場要看的六件事、怎麼看懂雪道地圖與月份差異。',
    },
  ],

  '/tools/taiwan-indoor-ski': [
    {
      slug: 'ski-intro-20260930',
      title: '第一次滑雪要知道的事：單雙板差別、雪場怎麼挑、行前裝備與醫師的提醒',
      why: '第一次滑雪該先在台灣練什麼、出發前還要準備什麼。',
    },
  ],
};
