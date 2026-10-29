/**
 * 特殊規則（創作者設計的六條連鎖效應）
 *
 * 每一回合評分之後，先把政策的加減分套到分數上，再依照套完之後的分數觸發規則。
 * 規則本身不存在資料庫，而是每次算分時重新推導，所以重新評分、手動改分都會一起更新。
 *
 * 1. 醫師奉獻度 < 30 → 護理人力 -5；護理人力 < 30 → 醫師奉獻度 -5（環境差會互相影響，每回合累計）
 * 2. 選票與民眾健康「連續兩回合都加分」→ 預算 +（兩回合選票加分總和 + 兩回合民眾健康加分總和）/ 2（民心化成預算）
 * 3. 選票 < 30 的回合結束後，下一回合預算最多只能用 5 分，直到選票回到 30 以上（失去執政正當性，預算難以掌控）
 * 4. 民眾健康 < 30 → 五項全部 -5（全台健康不佳拖累社會各面向，每回合累計）
 * 5. 醫師奉獻度 < 30 → 民眾健康 -5（真正需要治療的人找不到醫師，每回合累計）
 * 6. 每回合預算 +5（政府固定年度預算）
 */

import { RESOURCES, RULES, LOW_SCORE } from '../../../src/data/policyGameResources';

export { RULES };
export const LOW = LOW_SCORE;
export const ANNUAL_BUDGET = 5;
export const BUDGET_CAP_WHEN_UNPOPULAR = 5;

const RESOURCE_KEYS = RESOURCES.map((r) => r.key);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const zero = () => Object.fromEntries(RESOURCE_KEYS.map((k) => [k, 0]));

/**
 * 規則 3：這一回合開始時可以用的預算上限（分）。null 表示沒有限制。
 * @param {object} scoresBefore 回合開始時的分數
 */
export function budgetCap(scoresBefore) {
  return scoresBefore.votes < LOW ? BUDGET_CAP_WHEN_UNPOPULAR : null;
}

/**
 * 算出這一回合觸發的規則效果。
 * @param {object} scoresBefore 回合開始時的分數
 * @param {object} policy       這一回合政策的加減分
 * @param {object|null} prevPolicy 上一回合政策的加減分（沒有就 null）
 * @returns {{ id:string, title:string, text:string, deltas:object }[]}
 */
export function roundEffects(scoresBefore, policy, prevPolicy) {
  const after = {};
  for (const k of RESOURCE_KEYS) after[k] = clamp(scoresBefore[k] + (policy?.[k] ?? 0), 0, 100);

  const effects = [];
  const push = (id, text, deltas) => {
    const rule = RULES.find((r) => r.id === id);
    effects.push({ id, title: rule?.title ?? id, text, deltas: { ...zero(), ...deltas } });
  };

  // 6. 年度預算
  push('annual', '年度預算撥款 5 億。', { budget: ANNUAL_BUDGET });

  // 1. 醫護互相拖累
  if (after.doctors < LOW) push('spill', `醫師奉獻度 ${after.doctors} 分低於 30，醫師流失讓護理人員扛更多：護理人力 −5。`, { nurses: -5 });
  if (after.nurses < LOW) push('spill', `護理人力 ${after.nurses} 分低於 30，病房撐不住讓醫師也想走：醫師奉獻度 −5。`, { doctors: -5 });

  // 5. 找不到醫師
  if (after.doctors < LOW) push('nodoctor', `醫師奉獻度 ${after.doctors} 分低於 30，真正需要治療的人找不到醫師：民眾健康 −5。`, { health: -5 });

  // 4. 全民健康拖垮一切
  if (after.health < LOW) {
    push('sick', `民眾健康 ${after.health} 分低於 30，全台健康不佳拖累社會各面向：五項全部 −5。`, Object.fromEntries(RESOURCE_KEYS.map((k) => [k, -5])));
  }

  // 2. 民心化成預算
  if (prevPolicy && policy) {
    const v1 = prevPolicy.votes ?? 0, v2 = policy.votes ?? 0, h1 = prevPolicy.health ?? 0, h2 = policy.health ?? 0;
    if (v1 > 0 && v2 > 0 && h1 > 0 && h2 > 0) {
      const bonus = Math.round((v1 + v2 + h1 + h2) / 2);
      push('mandate', `選票與民眾健康連續兩回合加分（選票 +${v1}、+${v2}；健康 +${h1}、+${h2}），民心化成預算：預算 +${bonus}。`, { budget: bonus });
    }
  }

  return effects;
}

/** 回合開始時給玩家看的警示：哪些分數已經低於 30、接下來會發生什麼 */
export function warningsFor(scores) {
  const out = [];
  const cap = budgetCap(scores);
  if (cap !== null) out.push(`選票 ${scores.votes} 分低於 30，失去執政正當性：這一回合預算最多只能動用 ${cap} 分，直到選票回到 30 以上。`);
  if (scores.doctors < LOW) out.push(`醫師奉獻度 ${scores.doctors} 分低於 30：若回合結束仍低於 30，護理人力 −5、民眾健康 −5。`);
  if (scores.nurses < LOW) out.push(`護理人力 ${scores.nurses} 分低於 30：若回合結束仍低於 30，醫師奉獻度 −5。`);
  if (scores.health < LOW) out.push(`民眾健康 ${scores.health} 分低於 30：若回合結束仍低於 30，五項資源全部 −5。`);
  return out;
}
