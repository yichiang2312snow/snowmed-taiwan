/**
 * 日本雪場資料的型別定義
 *
 * ⚠️ 維護規則
 * 每一個「數字」欄位都必須附上 source（實際看到它的網址）與 checkedAt（查證日期）。
 * 查不到就填 null 並在 missingNote 說明為什麼 —— 寧可留白，不要自己推估。
 * 票價與難易度比率每個雪季都可能調整，所以頁面上一律顯示查證日期並要使用者以官網為準。
 */

export type Gateway = 'hokkaido' | 'tokyo';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Priority = 'powder' | 'language' | 'family' | 'onsen' | 'value' | 'short';

/** 有來源的數據 */
export interface Sourced<T> {
  value: T;
  /** official = 雪場官網；secondary = 第三方專業站 */
  level: 'official' | 'secondary';
  source: string;
  sourceLabel: string;
  checkedAt: string;
}

export interface Difficulty {
  beginner: number | null;
  intermediate: number | null;
  advanced: number | null;
  level?: 'official' | 'secondary';
  source?: string;
  sourceLabel?: string;
  checkedAt?: string;
  /** 沒有數據時說明原因 */
  missingNote?: string;
  /** 比率代表的是哪一個雪場（多雪場區域用） */
  representing?: string;
}

export interface Family {
  /** 有沒有托兒服務，以及收托年齡下限的說明 */
  childcare: string | null;
  /** 兒童雪上樂園／兒童滑雪學校 */
  kidsFacilities: string | null;
  /** 兒童纜車票優惠 */
  kidsTicket: string | null;
  /** 綜合評價：適合帶小孩的程度 */
  rating: 'high' | 'medium' | 'low';
  source?: string;
  checkedAt?: string;
}

export interface Language {
  /** 官網提供的語言 */
  siteLanguages: string[];
  /** 官網有沒有繁體中文 */
  hasTraditionalChinese: boolean;
  /** 英語服務單位（滑雪學校等） */
  englishService: string | null;
  /** 中文教練，查無就寫 null */
  chineseInstructor: string | null;
  source?: string;
  checkedAt?: string;
}

export interface Pricing {
  /** 一日纜車券大人票價（日圓） */
  adultYen: number | null;
  childYen: number | null;
  /** 適用雪季，例如 '2026-27' */
  season: string;
  /** 相對其他日本雪場的定位 */
  tier: 'high' | 'mid-high' | 'mid' | 'low';
  note?: string;
  source?: string;
  checkedAt?: string;
}

export interface Resort {
  id: string;
  name: string;
  nameJa: string;
  prefecture: string;
  gateway: Gateway;
  access: string;
  levels: Level[];
  priorities: Priority[];
  why: string;
  caution?: string;
  officialUrl: string;
  /** 對應 /emergency 頁面上的醫療資訊區塊 id */
  medicalAnchor?: string;

  difficulty: Difficulty;
  family: Family;
  language: Language;
  pricing: Pricing;
}
