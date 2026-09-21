/**
 * 日本雪場指引的每週更新紀錄
 *
 * 每週由排程任務（scheduled task `japan-resorts-weekly`）上網查證後追加，
 * 頁面上會顯示「最近更新」與每個雪場卡片裡的「近期動態」。
 *
 * ⚠️ 維護規則（跟 japanResorts.ts 一樣）
 * - 每一則都要有 source（實際看到的網址）與 date。
 * - sourceLevel：official = 雪場／飯店／官方觀光單位；secondary = 專業資料站、新聞、部落格。
 *   第三方的內容只能放這裡當「動態」，不能拿去改 japanResorts.ts 裡的數字。
 * - 跟安全有關的（巡邏隊、醫療、纜車異動、雪崩）排在前面，票價與設施其次。
 * - 只留最近 8 週；更舊的刪掉，git 歷史還查得到。
 */

export interface ResortUpdate {
  /** YYYY-MM-DD，查證日 */
  date: string;
  /** 對應 japanResorts.ts 的 id；跟單一雪場無關的整體資訊填 null */
  resortId: string | null;
  /** safety = 巡邏隊／醫療／纜車異動／天候；price = 票價；facility = 設施與服務；season = 開季／營業日期 */
  kind: 'safety' | 'price' | 'facility' | 'season';
  title: string;
  summary: string;
  source: string;
  sourceLabel: string;
  sourceLevel: 'official' | 'secondary';
}

export const RESORT_UPDATES: ResortUpdate[] = [
  // ── 2026-09-21 ──────────────────────────────────────
  {
    date: '2026-09-21',
    resortId: 'gala',
    kind: 'safety',
    title: 'GALA 湯澤：2026-27 雪季「南區」整季休止',
    summary:
      '官方 9/15 公告，2026-27 冬季休止南エリア的營業。GALA 全場 16 條雪道分北區 6、中央區 5、南區 4，南區關閉等於少掉約四分之一的雪道。官方雪道頁目前仍是舊的 16 條資料、尚未改版，實際可滑範圍與難易度比率請以到場當日的公告為準。',
    source: 'https://gala.co.jp/winter/',
    sourceLabel: 'GALA湯沢 官方公告',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'karuizawa',
    kind: 'price',
    title: '輕井澤王子：2026-27 票價與雪季日期公布',
    summary:
      '正規期（12/19–3/22）大人一日券 ¥10,000，與上季同價；特定日 ¥12,000、年末年始與 2 月連假 ¥13,000。開季期（10/31–12/18）與春滑（3/23–3/31）¥8,000。小學生以下仍然免費。10/31 開季，是這 10 座裡最早開的。',
    source: 'https://www.princehotels.co.jp/ski/karuizawa/winter/lift/',
    sourceLabel: '軽井沢プリンス 官方リフト券頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: null,
    kind: 'price',
    title: '日本雪場纜車票平均調漲約 8%',
    summary:
      '媒體整理全國 64 處主要雪場，2026-27 大人一日券平均 ¥7,327，比前一季的 ¥6,811 漲約 8%。這是第三方統計、不是官方數字，本站各雪場卡片上的票價一律以官網查證為準；提供參考是因為早鳥與線上預售的價差今年更值得先算過。',
    source: 'https://www.sports-life.com.tw/catalog/2026-27%E9%9B%AA%E5%AD%A3%E6%97%A5%E6%9C%AC%E6%BB%91%E9%9B%AA%E5%A0%B4%E7%BA%9C%E8%BB%8A%E7%A5%A8%E6%BC%B2%E5%83%B9%E4%B8%80%E8%A6%BD%EF%BC%9A%E5%85%A8%E5%9C%8B%E5%B9%B3%E5%9D%87%E8%AA%BF%E6%BC%B28/',
    sourceLabel: '運動生活 x 日台動感（第三方整理）',
    sourceLevel: 'secondary',
  },
  {
    date: '2026-09-21',
    resortId: 'niseko',
    kind: 'season',
    title: '二世谷：2026-27 營業期間公布（11/28 開季）',
    summary:
      '全山多數區域 2026/11/28–2027/5/5，但收季日各區不同：Niseko Village 到 4/4、HANAZONO 到 4/11。比羅夫夜滑 12/12–3/22。排四月上旬的行程要先確認要滑的那一區還有沒有開。',
    source: 'https://www.niseko.ne.jp/en/lift/',
    sourceLabel: 'Niseko United 官方 Lift Pass 頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'niseko',
    kind: 'facility',
    title: '比羅夫：エース第 3 纜車更新',
    summary:
      '比羅夫官方 9/17 公告 2026-27 更新エース第 3 リフト。官方雪道統計維持 22 條（初級 9、中級 6、上級 7），本站卡片的難易度比率不變。',
    source: 'https://www.grand-hirafu.jp/snow/',
    sourceLabel: '二世谷東急 Grand Hirafu 官方',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'niseko',
    kind: 'facility',
    title: '二世谷村：新纜車「新 森のゴンドラ」12 月啟用（第 1 區間）',
    summary:
      '滑雪媒體報導，Niseko Village 把老舊的 5 條纜車整併為 2 條新纜車加 1 條吊椅，8 人座的「新 森のゴンドラ」第 1 區間 2026 年 12 月啟用、山頂側第 2 區間 2027 年 12 月完成，輸送量約為現在的兩倍。第三方報導，細節請以官方公告為準。',
    source: 'https://japowcast.com/magazine/resort-news-2026-27',
    sourceLabel: 'JAPOW CAST（第三方滑雪媒體）',
    sourceLevel: 'secondary',
  },
  {
    date: '2026-09-21',
    resortId: 'rusutsu',
    kind: 'facility',
    title: '留壽都：札幌⇄留壽都冬季接駁巴士改為收費',
    summary:
      '官方 9/17 公告，冬季的「ルスツ号」札幌接駁巴士將改為收費（官網尚未載明票價）。這條路線過去免費，是很多人從札幌進出的主要方式，抓預算時要留意。仍為前一日 15:00 前的預約制。',
    source: 'https://rusutsu.com/access-shuttle-bus-sapporo/',
    sourceLabel: 'ルスツリゾート 官方接駁巴士頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'rusutsu',
    kind: 'facility',
    title: '留壽都：托兒所時段與公休日更新',
    summary:
      '官方頁面現載 08:30–18:30（比先前查到的 09:00–17:00 長），但每週二公休；每小時 ¥2,000，午餐 ¥1,300、點心 ¥250 另計。冬季開放 2026/11/28–2027/3/31。本站卡片的托兒欄位已同步更新。',
    source: 'https://rusutsu.com/nursery-school/',
    sourceLabel: 'ルスツリゾート 官方保育園頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'hakuba',
    kind: 'season',
    title: '白馬八方尾根：2026-27 營業期間公布（12/1 開季）',
    summary:
      '八方尾根 2026/12/1–2027/5/5。票價與上次查證相同：旺季（12/19–3/22）大人 ¥9,800、兒童 ¥4,900；開季（12/1–12/18）與春滑（3/23–5/5）大人 ¥6,400、兒童 ¥3,200。5 歲以下免費。',
    source: 'https://www.happo-one.jp/en/ticket/',
    sourceLabel: '八方尾根 官方票價頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'hakuba',
    kind: 'facility',
    title: '栂池：ハンの木第 3 纜車換成 6 人座「T3」',
    summary:
      '滑雪媒體報導，栂池高原 2026 年 12 月把ハンの木第 3 クワッド換成 6 人座的「T3」。栂池是白馬區裡初級比例較高、且有繁體中文的一場，帶新手的人可以留意。第三方報導，請以官方公告為準。',
    source: 'https://japowcast.com/magazine/resort-news-2026-27',
    sourceLabel: 'JAPOW CAST（第三方滑雪媒體）',
    sourceLevel: 'secondary',
  },
  {
    date: '2026-09-21',
    resortId: 'shigakogen',
    kind: 'season',
    title: '志賀高原：2026-27 營業期間公布（12/5 開季）',
    summary:
      '2026/12/5–2027/5/5。共通券大人 ¥9,500、兒童（0–12 歲）¥4,000、60 歲以上 ¥8,000，與上次查證相同。未就學兒每位付費大人可免費帶 1 名；12/20、1/17、2/21、3/21、4/18 五個「滑雪兒童日」小學生一日券免費。',
    source: 'https://shigakogen-ski.or.jp/winter/ticket/',
    sourceLabel: '志賀高原 官方票價頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'nozawa',
    kind: 'season',
    title: '野澤溫泉：2026-27 營業期間公布（11/28 開季）',
    summary:
      '2026/11/28–2027/5/5，正規票期間 12/19–3/28。大人 ¥7,800、未滿 15 歲 ¥4,700、60 歲以上 ¥6,300，與上次查證相同。5 歲以下每位付費大人可免費帶 1 名，但不發實體票。',
    source: 'https://en.nozawaski.com/the-mountain/lift-ticket/ticket-prices/',
    sourceLabel: '野沢温泉スキー場 官方英文票價頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'tomamu',
    kind: 'season',
    title: 'TOMAMU：2026-27 營業期間公布（12/1 開季）',
    summary:
      '2026/12/1–2027/4/5（RISONARE 到 4/1）；霧冰平台同期營運。雪校官方仍明載日語、英語、中文教練在籍，兒童團體課 4–6 歲與 7–12 歲、私人課 4 歲起。2026-27 票價官方表示約 9 月公布，本次查證時尚未上架，卡片維持上季價格並註明。',
    source: 'https://www.snowtomamu.jp/winter/',
    sourceLabel: '星野リゾート トマム 官方冬季頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-09-21',
    resortId: 'furano',
    kind: 'season',
    title: '富良野：2026-27 開季日公布（11/28）',
    summary:
      '官方公布 2026/11/28 開季。一日券價格尚未上架（上季旺季 ¥8,000、開季與春滑 ¥6,500），卡片維持上季數字並註明未公布。小學生以下纜車免費的政策未變。',
    source: 'https://www.princehotels.co.jp/ski/furano/winter/lift/',
    sourceLabel: '富良野スキー場 官方リフト券頁',
    sourceLevel: 'official',
  },
  // ── 2026-09-14 ──────────────────────────────────────
  {
    date: '2026-09-14',
    resortId: null,
    kind: 'facility',
    title: '首版上線：10 座雪場全數以官方資料查證',
    summary:
      '難易度比率、帶小孩、中英文服務、ski-in / ski-out、一日券票價，每一筆都回到雪場官網或官方觀光單位查證並標註日期。之後每週檢查一次官方公告，有異動會記在這裡。',
    source: 'https://snowmed-taiwan.com/tools/japan-resorts/#cite',
    sourceLabel: '本站',
    sourceLevel: 'official',
  },
];

/**
 * 最近一次「檢查」的日期（每週排程跑完就改成當天，就算沒有異動也要改）。
 * 頁面上的「上次查證」顯示這個，而不是最後一則更新的日期。
 */
export const LAST_CHECKED = '2026-09-21';
