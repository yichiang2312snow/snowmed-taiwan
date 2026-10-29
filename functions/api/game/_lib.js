/**
 * 「台灣醫療決策者體驗」共用邏輯
 *
 * 資料存在 D1（binding：GAME_DB，資料表見 db/game-schema.sql）。
 * 分數永遠是算出來的：起始 60 分，依序套用每個已評分回合的加減分，每一步都夾在 0～100。
 * 這樣主持人重新評分、手動改分，都不會把分數算壞。
 *
 * 檔名開頭的底線讓 Cloudflare Pages 不把它當成 API 路由。
 */

import { EVENT_CARDS, CARD_BY_ID } from '../../../src/data/policyGameCards';
import { RESOURCES, START_SCORE, MAX_POLICY_CHARS, MAX_TEAMS, MAX_DELTA, AI_MAX_DELTA, DELTA_SCALE } from '../../../src/data/policyGameResources';
import { roundEffects, budgetCap, warningsFor } from './_rules.js';

export { EVENT_CARDS, CARD_BY_ID, RESOURCES, START_SCORE, MAX_POLICY_CHARS, MAX_TEAMS, MAX_DELTA, AI_MAX_DELTA, DELTA_SCALE };

export const RESOURCE_KEYS = RESOURCES.map((r) => r.key);
/** AI 評分卡住超過這麼久，主持人就可以重新按評分 */
export const SCORING_STALE_MS = 3 * 60 * 1000;


export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const fail = (error, status = 400) => json({ ok: false, error }, status);

/** 固定時間比較，避免用回應時間猜 token */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function bearer(request) {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

/** 主持人密碼：GAME_HOST_TOKEN，沒設就沿用後台的 WISH_ADMIN_TOKEN；兩個都沒有就回 503 */
export function authorizeHost(request, env) {
  const expected = env.GAME_HOST_TOKEN ?? env.WISH_ADMIN_TOKEN;
  if (!expected) return fail('尚未設定主持人密碼（GAME_HOST_TOKEN）', 503);
  if (!safeEqual(bearer(request), expected.trim())) return fail('主持人密碼不對', 401);
  return null;
}

export async function readBody(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 去掉容易看錯的 I、L、O、0、1
export function randomCode(len = 4) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export function randomToken(bytes = 24) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** 以 Unicode 字元計算長度（emoji、中文都算一個字） */
export const charCount = (s) => Array.from(String(s ?? '')).length;

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** 把 AI（或懲罰表）的加減分乘上放大倍率，夾在實際上限內 */
export function scaleDeltas(input) {
  const out = {};
  for (const key of RESOURCE_KEYS) {
    const raw = Number(input?.[key] ?? 0) * DELTA_SCALE;
    const n = Math.sign(raw) * Math.round(Math.abs(raw)); // 正負對稱：-7.5 → -8，7.5 → 8
    out[key] = Number.isFinite(n) ? clamp(n, -MAX_DELTA, MAX_DELTA) : 0;
  }
  return out;
}

/** 亂答、沒交：判定「政府無能、沒有決策力」，民心下滑（基準 -5/-5/-5/-12/-8，再乘放大倍率） */
export const PENALTY_DELTAS = scaleDeltas({ budget: -5, nurses: -5, doctors: -5, votes: -12, health: -8 });

/** 把任何輸入整理成合法的加減分物件 */
export function normalizeDeltas(input) {
  const out = {};
  for (const key of RESOURCE_KEYS) {
    const n = Math.round(Number(input?.[key] ?? 0));
    out[key] = Number.isFinite(n) ? clamp(n, -MAX_DELTA, MAX_DELTA) : 0;
  }
  return out;
}

// ── 讀取 ──────────────────────────────────────────────────

export async function loadGame(db, code) {
  if (code) {
    return db.prepare('SELECT * FROM game_games WHERE code = ?').bind(code).first();
  }
  return db.prepare('SELECT * FROM game_games ORDER BY created_at DESC LIMIT 1').first();
}

export async function loadTeams(db, code) {
  const { results } = await db
    .prepare('SELECT * FROM game_teams WHERE code = ? ORDER BY joined_at ASC')
    .bind(code)
    .all();
  return results ?? [];
}

export async function loadRounds(db, code) {
  const { results } = await db
    .prepare('SELECT * FROM game_rounds WHERE code = ? ORDER BY round ASC')
    .bind(code)
    .all();
  return results ?? [];
}

export async function loadSubmissions(db, code) {
  const { results } = await db
    .prepare('SELECT * FROM game_submissions WHERE code = ? ORDER BY round ASC')
    .bind(code)
    .all();
  return (results ?? []).map((s) => ({
    ...s,
    deltas: s.deltas ? safeParse(s.deltas) : null,
    irrelevant: !!s.irrelevant,
    manual: !!s.manual,
  }));
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── 分數與名次 ────────────────────────────────────────────

/**
 * 起始 60 分，依序套用每個已評分回合：先套政策的加減分，再套特殊規則的效果，每一步都夾在 0～100。
 * 回傳最後分數與每一回合的紀錄（政策加減分、觸發的規則、回合前後分數）。
 * 規則效果不存資料庫，每次都重新推導，所以重評、手動改分都會一起更新。
 */
export function computeTeam(team, rounds, submissions) {
  let scores = Object.fromEntries(RESOURCE_KEYS.map((k) => [k, START_SCORE]));
  const log = [];
  let prevPolicy = null;
  for (const r of rounds) {
    if (!r.scored_at) continue;
    const sub = submissions.find((s) => s.team_id === team.id && s.round === r.round);
    // 這一組這回合沒有分數（例如中途才加入）：規則也不觸發，分數原地不動
    if (!sub?.deltas) {
      prevPolicy = null;
      continue;
    }
    const before = { ...scores };
    const policy = sub.deltas;
    const effects = roundEffects(before, policy, prevPolicy);
    const next = {};
    for (const k of RESOURCE_KEYS) {
      let v = clamp(before[k] + (policy[k] ?? 0), 0, 100);
      for (const e of effects) v = clamp(v + (e.deltas[k] ?? 0), 0, 100);
      next[k] = v;
    }
    log.push({ round: r.round, before, policy, effects, after: next });
    scores = next;
    prevPolicy = policy;
  }
  return { scores, log };
}

export const computeScores = (team, rounds, submissions) => computeTeam(team, rounds, submissions).scores;

/**
 * 某一回合開始前的脈絡：分數、前兩回合的政策加減分、這一回合的預算上限與警示。
 * round 還沒評分時，before 就是目前分數；規則 4～8 都要看前兩回合，所以一起算。
 */
export function roundContext(team, rounds, submissions, round) {
  const earlier = rounds.filter((r) => r.round < round);
  const { scores, log } = computeTeam(team, earlier, submissions);
  const prev1 = log.length >= 1 ? log[log.length - 1].policy : null;
  const prev2 = log.length >= 2 ? log[log.length - 2].policy : null;
  return { before: scores, prev1, prev2, cap: budgetCap(prev1, prev2), warnings: warningsFor(scores, prev1, prev2) };
}

/** 某一回合開始前的分數（舊介面，保留給其他地方用） */
export function scoresBeforeRound(team, rounds, submissions, round) {
  return roundContext(team, rounds, submissions, round).before;
}

export { budgetCap, warningsFor };

export const total = (scores) => RESOURCE_KEYS.reduce((sum, k) => sum + scores[k], 0);

function stddev(scores) {
  const vals = RESOURCE_KEYS.map((k) => scores[k]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length);
}

/**
 * 名次規則（照遊戲設計）：
 *   1. 有任何一項掉到 0 分的組別不能贏（排在所有合格組別後面）
 *   2. 總分高者勝
 *   3. 同分：五項都大於 60 分者優先
 *   4. 還是同分：五項分數最平均（標準差最小）者優先
 */
export function rankTeams(teams) {
  const decorated = teams.map((t) => ({
    ...t,
    total: total(t.scores),
    eligible: RESOURCE_KEYS.every((k) => t.scores[k] > 0),
    allAbove60: RESOURCE_KEYS.every((k) => t.scores[k] > 60),
    spread: stddev(t.scores),
  }));
  decorated.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (a.total !== b.total) return b.total - a.total;
    if (a.allAbove60 !== b.allAbove60) return a.allAbove60 ? -1 : 1;
    if (a.spread !== b.spread) return a.spread - b.spread;
    return a.name.localeCompare(b.name, 'zh-Hant');
  });
  return decorated.map((t, i) => ({ ...t, rank: i + 1, spread: Math.round(t.spread * 10) / 10 }));
}

// ── 組出給前端的狀態 ──────────────────────────────────────

/**
 * @param {object} opts
 * @param {boolean} opts.host   主持人看得到還沒評分的政策內容與錯誤訊息
 * @param {string}  [opts.teamId] 哪一組在看（會附上自己的草稿）
 */
export async function buildState(db, game, { host = false, teamId = null, hostEnv = null } = {}) {
  const [teams, rounds, submissions] = await Promise.all([
    loadTeams(db, game.code),
    loadRounds(db, game.code),
    loadSubmissions(db, game.code),
  ]);

  const current = rounds.find((r) => r.round === game.round) ?? null;
  const card = current ? CARD_BY_ID.get(current.card_id) : null;
  const revealed = game.status === 'results' || game.status === 'ended';

  const computed = new Map(teams.map((t) => [t.id, computeTeam(t, rounds, submissions)]));
  const scored = teams.map((t) => ({ id: t.id, name: t.name, scores: computed.get(t.id).scores }));
  const ranked = rankTeams(scored);
  const inRound = game.status === 'discussing' || game.status === 'scoring';

  const teamsOut = ranked.map((t) => {
    const sub = current ? submissions.find((s) => s.team_id === t.id && s.round === current.round) : null;
    const log = computed.get(t.id).log;
    const currentLog = current && revealed ? log.find((l) => l.round === current.round) : null;
    // 最近一次評分回合的總分變化（含特殊規則）：結果頁看的是這一回合，討論中看的是上一回合
    const lastLog = log.length ? log[log.length - 1] : null;
    // 回合進行中：看這一回合開始前的脈絡；評分後：看下一回合的脈絡（所以 round 要 +1）
    const base = teams.find((x) => x.id === t.id);
    const ctx = roundContext(base, rounds, submissions, inRound ? game.round : game.round + 1);
    const out = {
      id: t.id,
      name: t.name,
      scores: t.scores,
      total: t.total,
      lastRound: lastLog ? { round: lastLog.round, total: total(lastLog.after) - total(lastLog.before) } : null,
      eligible: t.eligible,
      allAbove60: t.allAbove60,
      spread: t.spread,
      rank: t.rank,
      submitted: !!sub?.submitted_at,
      // 這一回合觸發的特殊規則（評分後才看得到）
      effects: currentLog ? currentLog.effects : [],
      // 下一回合（或進行中這一回合）的限制與警示
      budgetCap: ctx.cap,
      warnings: ctx.warnings,
    };
    // 遊戲結束：頒獎畫面要回顧每一組每回合寫了什麼、那一回合總分變化多少
    if (game.status === 'ended') {
      out.journey = log.map((l) => {
        const c = CARD_BY_ID.get(rounds.find((r) => r.round === l.round)?.card_id);
        const s = submissions.find((x) => x.team_id === t.id && x.round === l.round);
        return {
          round: l.round,
          cardId: c?.id ?? null,
          title: c?.title ?? `第 ${l.round} 回合`,
          emoji: c?.emoji ?? '',
          text: s?.text ?? '',
          irrelevant: !!s?.irrelevant,
          total: total(l.after) - total(l.before),
        };
      });
    }
    // 評分前只有主持人看得到各組寫了什麼；評分後大家都看得到（方便討論）
    if (sub && (host || revealed)) {
      out.result = {
        text: sub.text,
        submittedAt: sub.submitted_at,
        deltas: sub.deltas,
        explanation: sub.explanation,
        irrelevant: sub.irrelevant,
        manual: sub.manual,
      };
    }
    return out;
  });

  const state = {
    ok: true,
    code: game.code,
    status: game.status,
    round: game.round,
    totalCards: EVENT_CARDS.length,
    discussionMinutes: game.discussion_minutes,
    serverNow: Date.now(),
    deadlineAt: current?.deadline_at ?? null,
    roundOpenedAt: current?.opened_at ?? null,
    card: card
      ? { id: card.id, title: card.title, emoji: card.emoji, scenario: card.scenario, stakes: card.stakes, budgetUnit: card.budgetUnit, hints: card.hints }
      : null,
    maxDelta: MAX_DELTA,
    // 歷史典故只在評分後揭曉
    reference: card && revealed ? card.reference : null,
    roundSummary: current && revealed ? current.summary : null,
    teams: teamsOut,
    history: rounds
      .filter((r) => r.scored_at)
      .map((r) => {
        const c = CARD_BY_ID.get(r.card_id);
        return { round: r.round, cardId: r.card_id, title: c?.title ?? r.card_id, emoji: c?.emoji ?? '' };
      }),
    maxTeams: MAX_TEAMS,
    maxChars: MAX_POLICY_CHARS,
  };

  if (teamId) {
    const me = teams.find((t) => t.id === teamId);
    const sub = current ? submissions.find((s) => s.team_id === teamId && s.round === current.round) : null;
    const mine = teamsOut.find((t) => t.id === teamId);
    state.me = me
      ? {
          id: me.id,
          name: me.name,
          draft: sub?.text ?? '',
          submittedAt: sub?.submitted_at ?? null,
          result: sub && revealed ? { deltas: sub.deltas, explanation: sub.explanation, irrelevant: sub.irrelevant } : null,
          effects: mine?.effects ?? [],
          budgetCap: mine?.budgetCap ?? null,
          warnings: mine?.warnings ?? [],
        }
      : null;
  }

  if (host) {
    // 診斷用：只回報「有沒有設定、長度多少」，絕不回傳金鑰內容
    state.diagnostics = {
      anthropicKeySet: typeof hostEnv?.ANTHROPIC_API_KEY === 'string' && hostEnv.ANTHROPIC_API_KEY.length > 0,
      anthropicKeyLength: typeof hostEnv?.ANTHROPIC_API_KEY === 'string' ? hostEnv.ANTHROPIC_API_KEY.length : 0,
      mockAi: hostEnv?.GAME_MOCK_AI === '1',
      bindings: hostEnv ? Object.keys(hostEnv).sort() : [],
    };
    state.scoringError = game.scoring_error ?? null;
    state.scoringStartedAt = game.scoring_started_at ?? null;
    const used = new Set(rounds.map((r) => r.card_id));
    state.cards = EVENT_CARDS.map((c) => ({ id: c.id, title: c.title, emoji: c.emoji, used: used.has(c.id) }));
    // 評分後的完整典故與評分提示給主持人參考
    if (card) state.judgeNotes = card.judgeNotes;
    // 背景新聞影片只給主持人台（學生頁面不顯示，避免分心）
    if (card) state.video = card.video;
  }

  return state;
}
