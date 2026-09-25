/**
 * 過度訓練的九個症狀，以及它們在人形示意圖上的位置。
 *
 * 內容整理自楊醫師演講「過度訓練的症狀」那一張投影片。
 * 症狀不是「哪裡痛」而是全身性的反應，所以這裡是把每個症狀掛到「最容易被感覺到的地方」——
 * 目的是讓人一眼看懂「這些訊號會從身體的不同地方冒出來」，不是解剖定位。
 *
 * ⚠️ FATIGUE_REGIONS 必須涵蓋每一個症狀，漏掉任何一個 build 會直接失敗。
 */

export interface FatigueSymptom {
  id: string;
  label: string;
  /** 一句「怎麼算數」，避免有人把一般的累也勾下去 */
  hint: string;
}

export const SYMPTOMS: FatigueSymptom[] = [
  { id: 'mood', label: '情緒起伏', hint: '比平常容易煩躁、提不起勁，對本來喜歡的事也沒興趣。' },
  { id: 'focus', label: '無法專注', hint: '注意力難集中、反應變慢，動作也跟著變遲鈍。' },
  { id: 'sleep', label: '失眠', hint: '睡不著、睡不沉，或睡滿八小時醒來還是覺得累。' },
  { id: 'sick', label: '頻頻感冒', hint: '一個月內反覆感冒、喉嚨痛，或小傷口特別慢好。' },
  { id: 'hr', label: '心跳加快', hint: '早上剛醒來的心跳比自己平常快（大約多 5–10 下／分鐘以上）。' },
  { id: 'appetite', label: '沒有胃口', hint: '吃不下、體重下降，或訓練後完全不想吃東西。' },
  { id: 'doms', label: '肌肉痠痛', hint: '痠痛超過 72 小時還沒退，或每次訓練後都痛得比以前久。' },
  { id: 'weak', label: '持續無力', hint: '休息一整天也沒有回復的那種疲倦，不是單純的累。' },
  { id: 'perf', label: '表現下降', hint: '一樣的重量、一樣的雪道，做起來明顯比以前吃力。' },
];

export interface FatigueRegion {
  id: string;
  title: string;
  /** 寬螢幕時卡片放在人形的左邊還是右邊（窄螢幕一律堆疊） */
  side: 'left' | 'right';
  /** 這一區包含哪些症狀（對應 SYMPTOMS 的 id） */
  symptoms: string[];
  /** 連線指到的身體位置（x 以身體中線為 0、向右為正；y 向下） */
  targets: Array<[number, number]>;
}

export const FATIGUE_REGIONS: FatigueRegion[] = [
  {
    id: 'brain',
    title: '腦・情緒・睡眠',
    side: 'left',
    symptoms: ['mood', 'focus', 'sleep'],
    targets: [[-20, 66]],
  },
  {
    id: 'immune',
    title: '免疫力',
    side: 'right',
    symptoms: ['sick'],
    targets: [[12, 140]],
  },
  {
    id: 'heart',
    title: '心跳',
    side: 'right',
    symptoms: ['hr'],
    targets: [[24, 200]],
  },
  {
    id: 'stomach',
    title: '食慾',
    side: 'right',
    symptoms: ['appetite'],
    targets: [[22, 288]],
  },
  {
    id: 'muscle',
    title: '肌肉',
    side: 'left',
    symptoms: ['doms'],
    targets: [
      [-34, 450],
      [-84, 262],
    ],
  },
  {
    id: 'whole',
    title: '整體狀態',
    side: 'left',
    symptoms: ['weak', 'perf'],
    targets: [[-30, 330]],
  },
];

// 漏標檢查：每個症狀都必須出現在圖上，而且不能重複掛兩個地方
const mapped = FATIGUE_REGIONS.flatMap((r) => r.symptoms);
const missing = SYMPTOMS.filter((s) => !mapped.includes(s.id)).map((s) => s.id);
if (missing.length) {
  throw new Error(`疲勞人形圖漏標了症狀：${missing.join('、')}`);
}
const dup = mapped.filter((id, i) => mapped.indexOf(id) !== i);
if (dup.length) {
  throw new Error(`疲勞人形圖有症狀被掛在兩個部位：${dup.join('、')}`);
}
const unknown = mapped.filter((id) => !SYMPTOMS.some((s) => s.id === id));
if (unknown.length) {
  throw new Error(`疲勞人形圖標到不存在的症狀：${unknown.join('、')}`);
}
