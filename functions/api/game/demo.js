/**
 * 「體驗一題」：主持人還沒開場時，訪客也可以自己抽一張事件卡、寫政策、拿 AI 回饋
 *
 *   GET  /api/game/demo?card=ID   抽一張事件卡（不指定就隨機）＋起始資源；順便回報目前有沒有正式場次在進行
 *   POST /api/game/demo  { cardId, text }
 *        → { id, card, before, after, deltas, explanation, irrelevant, effects, reference }
 *
 * 不需要登入也不需要入場密碼，所以有兩道簡單的額度：
 *   同一個 IP 每小時 GAME_DEMO_IP_LIMIT 次（預設 20；教室裡大家共用一個對外 IP，不能太小）
 *   全站每天 GAME_DEMO_DAY_LIMIT 次（預設 300），避免被人拿來刷 AI 額度
 * 每一次體驗都記在 game_demo（政策內容與分數），之後玩家留的回饋（/api/game/feedback）會連到這一筆。
 */

import {
  json,
  fail,
  readBody,
  loadGame,
  charCount,
  clamp,
  scaleDeltas,
  randomToken,
  ensureDemoTables,
  clientIp,
  EVENT_CARDS,
  CARD_BY_ID,
  RESOURCE_KEYS,
  START_SCORE,
  MAX_POLICY_CHARS,
  MAX_DELTA,
  PENALTY_DELTAS,
} from './_lib.js';
import { roundEffects } from './_rules.js';
import { scoreRound } from './_scorer.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const cardOut = (card) => ({ id: card.id, title: card.title, emoji: card.emoji, scenario: card.scenario, stakes: card.stakes, budgetUnit: card.budgetUnit, hints: card.hints });
const startScores = () => Object.fromEntries(RESOURCE_KEYS.map((k) => [k, START_SCORE]));

/** 目前有沒有正式場次（大廳或進行中）；有的話入口頁會請大家用密碼加入，而不是體驗 */
async function liveStatus(db) {
  const game = await loadGame(db, null);
  return game && game.status !== 'ended' ? game.status : null;
}

export async function onRequestGet({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);
  const url = new URL(request.url);
  const wanted = (url.searchParams.get('card') ?? '').trim();
  const card = CARD_BY_ID.get(wanted) ?? EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
  return json({
    ok: true,
    card: cardOut(card),
    scores: startScores(),
    maxChars: MAX_POLICY_CHARS,
    maxDelta: MAX_DELTA,
    liveGame: await liveStatus(db),
    cards: EVENT_CARDS.map((c) => ({ id: c.id, title: c.title, emoji: c.emoji })),
  });
}

export async function onRequestPost({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);
  await ensureDemoTables(db);

  const body = await readBody(request);
  const card = CARD_BY_ID.get(String(body.cardId ?? ''));
  if (!card) return fail('找不到這張事件卡，請重新整理再試一次');
  const text = String(body.text ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return fail('政策內容不能是空的');
  if (charCount(text) > MAX_POLICY_CHARS) return fail(`政策說明請在 ${MAX_POLICY_CHARS} 字以內`);

  // 額度：同一個 IP 每小時、全站每天
  const now = Date.now();
  const ip = clientIp(request);
  const ipLimit = Number(env.GAME_DEMO_IP_LIMIT) || 20;
  const dayLimit = Number(env.GAME_DEMO_DAY_LIMIT) || 300;
  const perIp = await db.prepare('SELECT COUNT(*) AS c FROM game_demo WHERE ip = ? AND created_at > ?').bind(ip, now - HOUR).first();
  if ((perIp?.c ?? 0) >= ipLimit) return fail('這個網路一小時內的體驗次數已經用完，請晚一點再試', 429);
  const perDay = await db.prepare('SELECT COUNT(*) AS c FROM game_demo WHERE created_at > ?').bind(now - DAY).first();
  if ((perDay?.c ?? 0) >= dayLimit) return fail('今天的體驗名額已經用完了，明天再來試試', 429);

  // 跟正式遊戲同一套評審：一組、第一回合、起始 60 分、沒有預算上限
  const before = startScores();
  let deltas;
  let explanation;
  let irrelevant;
  try {
    const scored = await scoreRound(env, {
      round: 1,
      card,
      entries: [{ teamId: 'demo', name: '體驗玩家', text, budget: before.budget, budgetCap: null }],
    });
    const r = scored.results.get('demo');
    irrelevant = r.irrelevant;
    explanation = r.explanation;
    deltas = irrelevant ? PENALTY_DELTAS : scaleDeltas(r.deltas);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('demo scoring failed:', message);
    return fail(`AI 評審暫時沒有回應，請再試一次（${message.slice(0, 120)}）`, 502);
  }

  // 套政策加減分，再套特殊規則（跟正式遊戲第一回合一樣）
  const effects = roundEffects(before, deltas, null);
  const after = {};
  for (const k of RESOURCE_KEYS) {
    let v = clamp(before[k] + (deltas[k] ?? 0), 0, 100);
    for (const e of effects) v = clamp(v + (e.deltas[k] ?? 0), 0, 100);
    after[k] = v;
  }

  const id = `d_${randomToken(6)}`;
  await db
    .prepare('INSERT INTO game_demo (id, ip, card_id, text, deltas, explanation, irrelevant, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, ip, card.id, text, JSON.stringify(deltas), explanation, irrelevant ? 1 : 0, now)
    .run();

  return json({ ok: true, id, card: cardOut(card), before, after, deltas, explanation, irrelevant, effects, reference: card.reference, maxDelta: MAX_DELTA });
}
