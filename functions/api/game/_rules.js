/**
 * 特殊規則（創作者設計的八條連鎖效應，2026-10-30 第二版）
 *
 * 每一回合評分之後，先把政策的加減分套到分數上，再依照「套完之後的分數」與「連續兩回合的政策加減分」觸發規則。
 * 規則本身不存資料庫，而是每次算分時重新推導，所以重新評分、手動改分都會一起更新。
 *
 * 1. 預算提撥：每回合預算 +3（政府固定年度預算）
 * 2. 醫療環境惡性循環：醫師奉獻度 < 45 → 護理人力 −5；護理人力 < 45 → 醫師奉獻度 −5（每回合累計）
 * 3. 民心化成預算：選票與民眾健康連續兩回合都加分 → 預算 +（兩回合選票加分 + 兩回合健康加分）÷ 2
 * 4. 選舉失利：選票連續兩回合被扣分 → 接下來那一回合預算最多只能動用 5 分
 * 5. 走向醫療崩壞：民眾健康連續兩回合被扣分 → 五項全部 −3（每回合累計）
 * 6. 七大皆空：醫師奉獻度連續兩回合被扣分 → 民眾健康 −5（每回合累計）
 * 7. 醫療外的生活品質：預算 < 50 → 選票 −2；預算 < 40 → 選票 −4（每回合累計）
 * 8. 沒護理師導致關閉病房開刀房：護理人力連續兩回合被扣分 → 醫師奉獻度 −3、民眾健康 −3、選票 −3（每回合累計）
 *
 * 「連續兩回合」看的是政策本身的加減分（AI 或主持人給的），不含規則效果。
 */

import { RESOURCES, RULES, LOW_SCORE } from '../../../src/data/policyGameResources';

export { RULES };
export const LOW = LOW_SCORE; // 45
export const ANNUAL_BUDGET = 3;
export const BUDGET_CAP_AFTER_LOSING_VOTES = 5;
export const BUDGET_WARN = 50;
export const BUDGET_LOW = 40;

const RESOURCE_KEYS = RESOURCES.map((r) => r.key);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const zero = () => Object.fromEntries(RESOURCE_KEYS.map((k) => [k, 0]));
const neg = (p, k) => !!p && (p[k] ?? 0) < 0;
const pos = (p, k) => !!p && (p[k] ?? 0) > 0;

/**
 * 規則 4：這一回合可以用的預算上限（分）。null 表示沒有限制。
 * @param {object|null} prev1 上一回合的政策加減分
 * @param {object|null} prev2 上上回合的政策加減分
 */
export function budgetCap(prev1, prev2) {
  return neg(prev1, 'votes') && neg(prev2, 'votes') ? BUDGET_CAP_AFTER_LOSING_VOTES : null;
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

  // 1. 預算提撥
  push('annual', `年度預算撥款 ${ANNUAL_BUDGET} 億。`, { budget: ANNUAL_BUDGET });

  // 2. 醫療環境惡性循環
  if (after.doctors < LOW) push('spill', `醫師奉獻度 ${after.doctors} 分低於 ${LOW}，醫師流失讓護理人員扛更多：護理人力 −5。`, { nurses: -5 });
  if (after.nurses < LOW) push('spill', `護理人力 ${after.nurses} 分低於 ${LOW}，病房撐不住讓醫師也想走：醫師奉獻度 −5。`, { doctors: -5 });

  // 3. 民心化成預算
  if (pos(policy, 'votes') && pos(prevPolicy, 'votes') && pos(policy, 'health') && pos(prevPolicy, 'health')) {
    const v1 = prevPolicy.votes, v2 = policy.votes, h1 = prevPolicy.health, h2 = policy.health;
    const bonus = Math.round((v1 + v2 + h1 + h2) / 2);
    push('mandate', `選票與民眾健康連續兩回合加分（選票 +${v1}、+${v2}；健康 +${h1}、+${h2}），民心化成預算：預算 +${bonus}。`, { budget: bonus });
  }

  // 5. 走向醫療崩壞
  if (neg(policy, 'health') && neg(prevPolicy, 'health')) {
    push('collapse', `民眾健康連續兩回合被扣分（${prevPolicy.health}、${policy.health}），全台健康惡化拖累社會各面向：五項全部 −3。`, Object.fromEntries(RESOURCE_KEYS.map((k) => [k, -3])));
  }

  // 6. 七大皆空
  if (neg(policy, 'doctors') && neg(prevPolicy, 'doctors')) {
    push('nodoctor', `醫師奉獻度連續兩回合被扣分（${prevPolicy.doctors}、${policy.doctors}），真正需要治療的人找不到醫師：民眾健康 −5。`, { health: -5 });
  }

  // 7. 醫療外的生活品質
  if (after.budget < BUDGET_LOW) push('austerity', `預算 ${after.budget} 分低於 ${BUDGET_LOW}，醫療以外的建設被排擠、生活品質下滑：選票 −4。`, { votes: -4 });
  else if (after.budget < BUDGET_WARN) push('austerity', `預算 ${after.budget} 分低於 ${BUDGET_WARN}，醫療以外的建設開始被排擠：選票 −2。`, { votes: -2 });

  // 8. 沒護理師導致關閉病房開刀房
  if (neg(policy, 'nurses') && neg(prevPolicy, 'nurses')) {
    push('wardclosure', `護理人力連續兩回合被扣分（${prevPolicy.nurses}、${policy.nurses}），病房與開刀房被迫關閉：醫師奉獻度 −3、民眾健康 −3、選票 −3。`, { doctors: -3, health: -3, votes: -3 });
  }

  return effects;
}

/**
 * 回合開始時給玩家看的警示：哪些條件已經踩到一半、這一回合再踩一次會發生什麼。
 * @param {object} scores 回合開始時的分數
 * @param {object|null} prev1 上一回合的政策加減分
 * @param {object|null} prev2 上上回合的政策加減分
 */
export function warningsFor(scores, prev1, prev2) {
  const out = [];
  const cap = budgetCap(prev1, prev2);
  if (cap !== null) out.push(`選票連續兩回合被扣分，失去執政正當性：這一回合預算最多只能動用 ${cap} 分。`);
  else if (neg(prev1, 'votes')) out.push(`上一回合選票被扣分（${prev1.votes}）：這一回合若再被扣，下一回合預算最多只能動用 ${BUDGET_CAP_AFTER_LOSING_VOTES} 分。`);
  if (neg(prev1, 'health')) out.push(`上一回合民眾健康被扣分（${prev1.health}）：這一回合若再被扣，五項資源全部 −3。`);
  if (neg(prev1, 'doctors')) out.push(`上一回合醫師奉獻度被扣分（${prev1.doctors}）：這一回合若再被扣，民眾健康 −5。`);
  if (neg(prev1, 'nurses')) out.push(`上一回合護理人力被扣分（${prev1.nurses}）：這一回合若再被扣，醫師奉獻度 −3、民眾健康 −3、選票 −3。`);
  if (scores.doctors < LOW) out.push(`醫師奉獻度 ${scores.doctors} 分低於 ${LOW}：回合結束仍低於 ${LOW}，護理人力 −5。`);
  if (scores.nurses < LOW) out.push(`護理人力 ${scores.nurses} 分低於 ${LOW}：回合結束仍低於 ${LOW}，醫師奉獻度 −5。`);
  if (scores.budget < BUDGET_LOW) out.push(`預算 ${scores.budget} 分低於 ${BUDGET_LOW}：回合結束仍低於 ${BUDGET_LOW}，選票 −4。`);
  else if (scores.budget < BUDGET_WARN) out.push(`預算 ${scores.budget} 分低於 ${BUDGET_WARN}：回合結束仍低於 ${BUDGET_WARN}，選票 −2（低於 ${BUDGET_LOW} 則 −4）。`);
  return out;
}
