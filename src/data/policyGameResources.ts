/**
 * 「台灣醫療決策者體驗」的五種資源
 *
 * 獨立成一個檔案，是因為前端頁面只需要這份對照表（名稱、emoji），
 * 不應該把整份事件卡（含歷史典故與評分提示）打包進瀏覽器端的 JS。
 */
export const RESOURCES = [
  { key: 'budget', label: '預算', emoji: '💰' },
  { key: 'nurses', label: '護理人力', emoji: '🩺' },
  { key: 'doctors', label: '醫師奉獻度', emoji: '👨‍⚕️' },
  { key: 'votes', label: '選票', emoji: '🗳️' },
  { key: 'health', label: '民眾健康', emoji: '❤️' },
] as const;

export type ResourceKey = (typeof RESOURCES)[number]['key'];
export type Scores = Record<ResourceKey, number>;

/** 每種資源的起始分數 */
export const START_SCORE = 60;
/** 單一回合、單一資源的加減分上限 */
export const MAX_DELTA = 20;
/** 低於這個分數會觸發特殊規則 */
export const LOW_SCORE = 30;

/**
 * 六條特殊規則的說明文字（遊戲首頁與組長頁顯示用）。
 * 實際的計算在 functions/api/game/_rules.js，兩邊要改請一起改。
 */
export const RULES = [
  { id: 'annual', title: '年度預算', text: '每回合衛福部固定獲得 5 億年度預算：預算 +5。' },
  {
    id: 'spill',
    title: '醫護互相拖累',
    text: '回合結束時醫師奉獻度低於 30，護理人力 −5；護理人力低於 30，醫師奉獻度 −5。環境差會互相影響，每回合累計。',
  },
  {
    id: 'mandate',
    title: '民心化成預算',
    text: '選票與民眾健康連續兩回合都加分，預算額外獲得（兩回合選票加分 ＋ 兩回合民眾健康加分）÷ 2。得民心的政府有錢做更多事。',
  },
  {
    id: 'cap',
    title: '失去執政權',
    text: '選票低於 30 之後，接下來每回合預算最多只能動用 5 分，直到選票回到 30 以上。',
  },
  { id: 'sick', title: '全民健康拖垮一切', text: '回合結束時民眾健康低於 30，五項資源全部 −5，每回合累計。' },
  {
    id: 'nodoctor',
    title: '找不到醫師',
    text: '回合結束時醫師奉獻度低於 30，民眾健康 −5：真正需要治療的人找不到醫師，每回合累計。',
  },
] as const;
/** 政策說明的字數上限 */
export const MAX_POLICY_CHARS = 50;
/** 同一場遊戲最多幾組 */
export const MAX_TEAMS = 10;
