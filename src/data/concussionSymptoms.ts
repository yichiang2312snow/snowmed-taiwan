/**
 * 腦震盪症狀，以及它們在人形示意圖上的位置。
 *
 * 紅旗症狀（RED_FLAGS）同時給頁面上方的紅框清單與人形圖使用 ——
 * 兩邊讀同一份資料，改一個字兩邊一起變，不會出現「紅框寫一套、圖上寫另一套」。
 * 分類依據 SCAT6 的紅旗症狀（BJSM 2023;57(11), doi:10.1136/bjsports-2023-107036）。
 *
 * ⚠️ BODY_REGIONS 必須涵蓋每一個紅旗症狀，漏掉任何一個 build 會直接失敗。
 */

export const RED_FLAGS = [
  '頸部疼痛或壓痛',
  '出現癲癇或抽搐',
  '意識喪失（不管多短）',
  '意識狀態持續變差，或愈來愈難叫醒',
  '劇烈或愈來愈嚴重的頭痛',
  '反覆嘔吐',
  '躁動、易怒、明顯的攻擊性',
  '複視（看東西有兩個影子）',
  '手腳無力、麻木或刺痛',
] as const;

export type RedFlag = (typeof RED_FLAGS)[number];

export interface BodyRegion {
  id: string;
  title: string;
  /** 寬螢幕時標籤放在人形的左邊還是右邊（窄螢幕一律放右邊） */
  side: 'left' | 'right';
  /** 紅旗症狀：立刻停止活動並就醫 */
  red: RedFlag[];
  /** 頁面內文提到的其他症狀（非 SCAT6 紅旗） */
  other: string[];
  /**
   * 連線要指到的身體位置，人形本身的座標（x 以身體中線為 0）。
   * x 一律寫正值；寬螢幕放在左側的標籤會自動鏡像到身體左半邊。
   */
  targets: Array<[number, number]>;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head',
    title: '頭部・大腦',
    side: 'left',
    red: [
      '意識喪失（不管多短）',
      '意識狀態持續變差，或愈來愈難叫醒',
      '劇烈或愈來愈嚴重的頭痛',
      '躁動、易怒、明顯的攻擊性',
    ],
    other: ['頭痛', '頭暈', '暫時性失憶'],
    targets: [[20, 66]],
  },
  {
    id: 'eyes',
    title: '眼睛',
    side: 'right',
    red: ['複視（看東西有兩個影子）'],
    other: [],
    targets: [[14, 101]],
  },
  {
    id: 'neck',
    title: '頸部',
    side: 'right',
    red: ['頸部疼痛或壓痛'],
    other: [],
    targets: [[10, 140]],
  },
  {
    id: 'body',
    title: '全身',
    side: 'right',
    red: ['出現癲癇或抽搐'],
    other: [],
    targets: [[34, 214]],
  },
  {
    id: 'stomach',
    title: '胃部',
    side: 'right',
    red: ['反覆嘔吐'],
    other: ['噁心'],
    targets: [[22, 288]],
  },
  {
    id: 'limbs',
    title: '手、腳',
    side: 'left',
    red: ['手腳無力、麻木或刺痛'],
    other: [],
    targets: [
      [94, 372],
      [44, 594],
    ],
  },
];

// 漏標檢查：每個紅旗症狀都必須出現在圖上
const mapped = new Set(BODY_REGIONS.flatMap((r) => r.red));
const missing = RED_FLAGS.filter((f) => !mapped.has(f));
if (missing.length) {
  throw new Error(`腦震盪人形圖漏標了紅旗症狀：${missing.join('、')}`);
}
