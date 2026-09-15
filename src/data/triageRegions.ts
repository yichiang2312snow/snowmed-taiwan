/**
 * 雪場受傷分流判斷：症狀依「身體部位」分組，畫在人形圖旁邊。
 *
 * 每個症狀都帶一個 level（red / orange / yellow），但頁面上刻意不顯示 ——
 * 使用者只看到「頭部有什麼症狀」「膝蓋有什麼症狀」，嚴重程度要等按了「看建議」才出現。
 * 這樣不會讓人覺得「勾了哪一組就得到哪一種答案」。
 *
 * targets 是人形圖上的座標（x 以身體中線為 0、向右為正；y 向下），
 * 跟 ConcussionBodyMap 用的是同一套人形。
 */

export type TriageLevel = 'red' | 'orange' | 'yellow';

export interface TriageItem {
  text: string;
  level: TriageLevel;
}

export interface TriageRegion {
  id: string;
  /** 顯示編號（手機版人形圖上的號碼） */
  n: number;
  title: string;
  hint?: string;
  /** 寬螢幕時卡片放在人形的左邊還是右邊 */
  side: 'left' | 'right';
  items: TriageItem[];
  /** 連線指到的身體位置 */
  targets: Array<[number, number]>;
}

export const TRIAGE_REGIONS: TriageRegion[] = [
  {
    id: 'head',
    n: 1,
    title: '頭部',
    hint: '有撞到頭、或安全帽有撞擊痕跡',
    side: 'left',
    items: [
      { text: '曾經失去意識，或現在意識不清、講話怪怪的', level: 'red' },
      { text: '撞到頭之後出現頭暈、想吐、反應變慢或記憶空白', level: 'orange' },
    ],
    targets: [[-22, 70]],
  },
  {
    id: 'spine',
    n: 2,
    title: '頸部・背部',
    hint: '脊椎一整條，從後頸到腰',
    side: 'right',
    items: [{ text: '頸部或背部劇痛，或手腳有麻木、無力感', level: 'red' }],
    targets: [
      [8, 140],
      [8, 250],
    ],
  },
  {
    id: 'chest',
    n: 3,
    title: '胸部・呼吸',
    side: 'left',
    items: [{ text: '呼吸困難、劇烈胸痛，或每次深呼吸都很痛', level: 'red' }],
    targets: [[-28, 205]],
  },
  {
    id: 'shoulder',
    n: 4,
    title: '肩膀',
    side: 'right',
    items: [{ text: '肩膀無法抬起，或看起來位置不對', level: 'orange' }],
    targets: [[66, 162]],
  },
  {
    id: 'joint',
    n: 5,
    title: '受傷的關節',
    hint: '不管是膝、踝、肘、腕還是肩，只要是關節都適用',
    side: 'left',
    items: [
      { text: '受傷當下聽到或感覺到「啪」的一聲', level: 'orange' },
      { text: '關節在一小時內就腫起來', level: 'orange' },
      { text: '關節有鬆掉、不穩、會突然軟腳的感覺', level: 'orange' },
      { text: '關節無法完全伸直或彎曲，或有卡住感', level: 'orange' },
      { text: '有腫脹，但是慢慢才腫起來的', level: 'yellow' },
    ],
    targets: [
      [-84, 262],
      [-32, 478],
    ],
  },
  {
    id: 'hand',
    n: 6,
    title: '手腕・拇指',
    hint: '單板向後跌倒撐地、雙板雪杖帶勾到拇指',
    side: 'right',
    items: [
      { text: '拇指根部（虎口內側）壓下去會痛，而且捏東西沒力', level: 'yellow' },
      { text: '手腕壓痛，轉動或用力時會痛', level: 'yellow' },
    ],
    targets: [[94, 372]],
  },
  {
    id: 'leg',
    n: 7,
    title: '腿・膝蓋・腳踝',
    hint: '看的是能不能踩地承重',
    side: 'right',
    items: [
      { text: '完全無法用受傷的腳承重，一踩就劇痛', level: 'red' },
      { text: '可以承重，但走路時持續疼痛', level: 'yellow' },
    ],
    targets: [
      [36, 478],
      [44, 594],
    ],
  },
  {
    id: 'any',
    n: 8,
    title: '任何部位',
    hint: '不限位置的整體狀況',
    side: 'left',
    items: [
      { text: '肢體明顯變形、角度不對，或有骨頭穿出皮膚', level: 'red' },
      { text: '大量出血，壓迫後仍止不住', level: 'red' },
      { text: '休息 48 小時後仍然沒有改善', level: 'yellow' },
    ],
    targets: [[-46, 400]],
  },
];
