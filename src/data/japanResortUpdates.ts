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

/** 最近一次更新的日期，頁面上顯示用 */
export const LAST_UPDATED = RESORT_UPDATES.map((u) => u.date).sort().at(-1) ?? '';
