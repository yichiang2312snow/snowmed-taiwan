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
/**
 * 加減分的放大倍率：AI 依照評分提示給 -20～+20 的分數，系統再乘上這個倍率，
 * 讓每回合的起伏更有感（創作者設定 1.5 倍）。
 */
export const DELTA_SCALE = 1.5;
/** AI 評審給分的範圍（放大之前） */
export const AI_MAX_DELTA = 20;
/** 單一回合、單一資源實際套用的加減分上限：放大之後再封頂 ±10（創作者設定） */
export const MAX_DELTA = 10;
/** 醫師奉獻度、護理人力低於這個分數會觸發「醫療環境惡性循環」 */
export const LOW_SCORE = 45;

/**
 * 八條特殊規則的說明文字（遊戲首頁、組長頁與主持人台顯示用）。
 * 實際的計算在 functions/api/game/_rules.js，兩邊要改請一起改。
 * 「連續兩回合」看的是政策本身的加減分，不含規則效果。
 */
export const RULES = [
  { id: 'annual', title: '預算提撥', text: '每回合衛福部固定獲得 3 億年度預算：預算 +3。' },
  {
    id: 'spill',
    title: '醫療環境惡性循環',
    text: '回合結束時醫師奉獻度低於 45，護理人力 −5；護理人力低於 45，醫師奉獻度 −5。環境差會互相影響，每回合累計。',
  },
  {
    id: 'mandate',
    title: '民心化成預算',
    text: '選票與民眾健康連續兩回合都加分，預算額外獲得（兩回合選票加分 ＋ 兩回合民眾健康加分）÷ 2。得民心的政府有錢做更多事。',
  },
  {
    id: 'cap',
    title: '選舉失利',
    text: '選票連續兩回合被扣分，接下來那一回合預算最多只能動用 5 分。失去選票等於失去執政權，預算難以掌控。',
  },
  {
    id: 'collapse',
    title: '走向醫療崩壞',
    text: '民眾健康連續兩回合被扣分，五項資源全部 −3，每回合累計。全台民眾健康不佳，會拖累社會各個面向。',
  },
  {
    id: 'nodoctor',
    title: '七大皆空',
    text: '醫師奉獻度連續兩回合被扣分，民眾健康 −5，每回合累計。醫師無法提供必要服務，真正需要治療的人找不到醫師。',
  },
  {
    id: 'austerity',
    title: '醫療外的生活品質',
    text: '回合結束時預算低於 50，選票 −2；低於 40，選票 −4。每回合累計。醫療以外的建設被排擠，民眾有感。',
  },
  {
    id: 'wardclosure',
    title: '沒護理師，病房開刀房關閉',
    text: '護理人力連續兩回合被扣分，醫師奉獻度 −3、民眾健康 −3、選票 −3，每回合累計。',
  },
] as const;
/** 政策說明的字數上限 */
export const MAX_POLICY_CHARS = 100;
/** 同一場遊戲最多幾組 */
export const MAX_TEAMS = 10;
