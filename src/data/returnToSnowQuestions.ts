/**
 * 回歸雪場準備度自評的六個面向，以及它們在人形示意圖上的位置。
 *
 * 跟腦震盪、疲勞那兩頁的差別：這裡不是「有沒有這個症狀」，而是每一項都要選一個程度（0–3 分），
 * 因為回歸運動的判斷本來就不是二分法。計分規則在元件裡：最弱的一項會拉低整體判斷。
 *
 * targets 的座標系跟其他人形圖一致（x 以身體中線為 0、向右為正；y 向下）。
 * 卡片依「指到的位置由上往下」排，連線才不會互相交叉。
 */

export interface RtsOption {
  label: string;
  score: 0 | 1 | 2 | 3;
}

export interface RtsQuestion {
  id: string;
  /** 人形圖上的號碼，也是卡片的顯示順序（同一側由小到大） */
  n: number;
  domain: string;
  q: string;
  hint: string;
  /** 寬螢幕時卡片放在人形的左邊還是右邊 */
  side: 'left' | 'right';
  /** 連線指到的身體位置 */
  targets: Array<[number, number]>;
  options: RtsOption[];
  /** 這一項是最弱環節時要給的說明 */
  gap: string;
}

export const RTS_QUESTIONS: RtsQuestion[] = [
  {
    id: 'time',
    n: 1,
    domain: '時間',
    q: '距離受傷或手術已經多久？',
    hint: '組織修復需要時間，這是無法靠訓練加速的部分。',
    side: 'left',
    targets: [[-26, 250]],
    options: [
      { label: '不到 3 個月', score: 0 },
      { label: '3–6 個月', score: 1 },
      { label: '6–9 個月', score: 2 },
      { label: '9 個月以上', score: 3 },
    ],
    gap: '時間還不夠。組織修復有生物學上的下限，這一項沒辦法靠努力加速 —— 把這段時間拿去把其他五項練好。',
  },
  {
    id: 'strength',
    n: 2,
    domain: '肌力對稱性',
    q: '受傷側和健康側比起來，肌力大概恢復到幾成？',
    hint: '可以用單腳蹲的次數、單腳站起的能力，或健身房同一動作的重量粗略比較。',
    side: 'left',
    targets: [[-30, 418]],
    options: [
      { label: '明顯比較弱（不到 7 成）', score: 0 },
      { label: '有差距（約 7–8 成）', score: 1 },
      { label: '接近（約 8–9 成）', score: 2 },
      { label: '幾乎一樣（9 成以上）', score: 3 },
    ],
    gap: '肌力對稱性不足。這是最常見、也最需要時間的缺口。重點放在患側的單側訓練與離心訓練，並定期比較左右差距。',
  },
  {
    id: 'control',
    n: 3,
    domain: '落地控制',
    q: '從約 30 公分高處跳下、雙腳落地時，膝蓋會不會往內塌？',
    hint: '請人從正面錄影比較準。看的是落地瞬間膝蓋有沒有往內偏。',
    side: 'left',
    targets: [[-32, 478]],
    options: [
      { label: '會明顯往內，或落地無法穩住', score: 0 },
      { label: '受傷側有一點往內', score: 1 },
      { label: '大致對齊，偶爾晃一下', score: 2 },
      { label: '兩側都穩定對齊', score: 3 },
    ],
    gap: '落地控制不佳。膝蓋落地時往內塌是前十字韌帶受傷的典型姿勢。加強臀中肌（側臥髖外展、單腳橋式），並反覆練習「安靜、對齊」的落地。',
  },
  {
    id: 'confidence',
    n: 4,
    domain: '心理準備度',
    q: '想到要再滑雪，你的信心程度？',
    hint: '這一項不是軟性指標。對再次受傷的恐懼，本身就是再次受傷的風險因子。',
    side: 'right',
    targets: [[20, 66]],
    options: [
      { label: '很怕，會想避開', score: 0 },
      { label: '有點緊張，不太敢做動作', score: 1 },
      { label: '大致有信心，偶爾會遲疑', score: 2 },
      { label: '完全有信心', score: 3 },
    ],
    gap: '心理準備度是目前的瓶頸。這需要的不是更多肌力訓練，而是循序漸進地重建信心：從完全有把握的動作開始，逐步加難度，必要時尋求專業協助。',
  },
  {
    id: 'pain',
    n: 5,
    domain: '症狀',
    q: '目前日常活動中的疼痛與腫脹狀況？',
    hint: '上下樓梯、久站、走遠路之後的反應。',
    side: 'right',
    targets: [[32, 478]],
    options: [
      { label: '還會痛，活動後會腫', score: 0 },
      { label: '偶爾酸，劇烈活動後會腫', score: 1 },
      { label: '日常沒感覺，運動後偶爾緊繃', score: 2 },
      { label: '完全沒有症狀', score: 3 },
    ],
    gap: '症狀還沒穩定。活動後會腫代表關節的負荷超過目前的承受度，這是回歸前必須先解決的問題，請回去找你的治療師調整。',
  },
  {
    id: 'hop',
    n: 6,
    domain: '功能測試',
    q: '單腳跳遠：受傷側的距離大約是健康側的幾成？',
    hint: '雙手插腰，單腳起跳、單腳落地並站穩 2 秒才算數。各做 3 次取最好的。',
    side: 'right',
    targets: [[44, 592]],
    options: [
      { label: '不敢做，或無法單腳落地站穩', score: 0 },
      { label: '不到 8 成', score: 1 },
      { label: '約 8–9 成', score: 2 },
      { label: '9 成以上', score: 3 },
    ],
    gap: '功能測試落後。你的肌力可能夠了，但還無法在動態中發揮出來。加入漸進式的跳躍訓練，從雙腳到單腳、從直線到側向。',
  },
];

// 同一側的卡片必須依 n 由小到大排，且 n 要跟「指到的位置由上往下」一致，連線才不會交叉
for (const side of ['left', 'right'] as const) {
  const list = RTS_QUESTIONS.filter((q) => q.side === side);
  const byN = [...list].sort((a, b) => a.n - b.n);
  const byY = [...list].sort((a, b) => a.targets[0][1] - b.targets[0][1]);
  if (byN.map((q) => q.id).join() !== byY.map((q) => q.id).join()) {
    throw new Error(`回歸雪場人形圖：${side} 側的卡片順序與連線高度不一致，連線會交叉`);
  }
}
