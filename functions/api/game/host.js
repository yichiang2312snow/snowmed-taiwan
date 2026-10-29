/**
 * 主持人（楊怡強醫師）的控制台 API
 *
 * 全部需要 Authorization: Bearer <GAME_HOST_TOKEN>
 *
 *   GET  /api/game/host                      讀目前這一場的完整狀態（含各組尚未評分的政策）
 *   POST /api/game/host  { action, ... }
 *     open         { minutes, code? }        開新大廳（舊的一場會被標成結束）；code 是自訂的入場密碼，沒給就隨機 4 碼
 *     start_round  { cardId? }               開始下一回合；不指定就隨機抽一張沒用過的卡
 *     extend       { minutes }               延長這一回合的討論時間
 *     score                                  AI 評分（沒交的組視為「沒有決策」）
 *     manual_score { teamId, deltas, explanation, irrelevant? }
 *                                            主持人手動給分／改分（AI 失敗或想修正時用）
 *     next                                   評分完回到討論階段前的空檔其實不需要，直接 start_round 即可
 *     end                                    結束遊戲，結算名次
 *     remove_team  { teamId }                把某一組踢出（組長可以重新加入）
 *
 * 設定主持人密碼：
 *   npx wrangler pages secret put GAME_HOST_TOKEN --project-name snowmed-taiwan
 */

import {
  json,
  fail,
  authorizeHost,
  readBody,
  loadGame,
  loadTeams,
  loadRounds,
  loadSubmissions,
  buildState,
  randomCode,
  normalizeDeltas,
  scaleDeltas,
  scoresBeforeRound,
  budgetCap,
  clamp,
  EVENT_CARDS,
  CARD_BY_ID,
  PENALTY_DELTAS,
  SCORING_STALE_MS,
} from './_lib.js';
import { scoreRound } from './_scorer.js';

const DEFAULT_MINUTES = 4;
const CODE_RE = /^[A-Z0-9]{4,12}$/;

export async function onRequestGet({ request, env }) {
  const denied = authorizeHost(request, env);
  if (denied) return denied;
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);

  const url = new URL(request.url);
  const code = (url.searchParams.get('code') ?? '').trim().toUpperCase() || null;
  const game = await loadGame(db, code);
  if (!game) return json({ ok: true, status: 'none', cards: EVENT_CARDS.map((c) => ({ id: c.id, title: c.title, emoji: c.emoji, used: false })) });
  return json(await buildState(db, game, { host: true, hostEnv: env }));
}

export async function onRequestPost({ request, env }) {
  const denied = authorizeHost(request, env);
  if (denied) return denied;
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);

  const body = await readBody(request);
  const action = String(body.action ?? '');
  const now = Date.now();

  if (action === 'open') {
    const minutes = clamp(Math.round(Number(body.minutes) || DEFAULT_MINUTES), 1, 30);

    // 入場密碼：主持人自訂（4～12 個英數字，不分大小寫），沒給就隨機產生 4 碼
    let code = String(body.code ?? '').trim().toUpperCase();
    if (code) {
      if (!CODE_RE.test(code)) return fail('入場密碼請用 4～12 個英文字母或數字');
      const exists = await db.prepare('SELECT 1 FROM game_games WHERE code = ?').bind(code).first();
      if (exists) return fail('這組入場密碼之前用過了，換一組吧（例如加上日期）', 409);
    } else {
      code = randomCode(4);
      for (let i = 0; i < 5; i++) {
        const exists = await db.prepare('SELECT 1 FROM game_games WHERE code = ?').bind(code).first();
        if (!exists) break;
        code = randomCode(4);
      }
    }

    // 同一時間只跑一場：把還沒結束的舊場次收掉
    await db.prepare("UPDATE game_games SET status = 'ended', updated_at = ? WHERE status != 'ended'").bind(now).run();
    await db
      .prepare('INSERT INTO game_games (code, status, round, discussion_minutes, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?)')
      .bind(code, 'lobby', minutes, now, now)
      .run();
    const game = await loadGame(db, code);
    return json(await buildState(db, game, { host: true, hostEnv: env }));
  }

  const game = await loadGame(db, body.code ? String(body.code).toUpperCase() : null);
  if (!game) return fail('目前沒有進行中的遊戲，請先開啟大廳', 404);
  if (game.status === 'ended' && action !== 'status') return fail('這一場已經結束，請開新的大廳', 409);

  const respond = async () => json(await buildState(db, await loadGame(db, game.code), { host: true, hostEnv: env }));

  switch (action) {
    case 'status':
      return respond();

    case 'start_round': {
      if (!['lobby', 'results'].includes(game.status)) return fail('現在不能開始新回合（請先完成這一回合的評分）', 409);
      const teams = await loadTeams(db, game.code);
      if (teams.length === 0) return fail('還沒有任何組別加入', 409);

      const rounds = await loadRounds(db, game.code);
      const used = new Set(rounds.map((r) => r.card_id));
      let cardId = body.cardId ? String(body.cardId) : '';
      if (cardId) {
        if (!CARD_BY_ID.has(cardId)) return fail('沒有這張事件卡');
        if (used.has(cardId)) return fail('這張事件卡已經用過了');
      } else {
        const unused = EVENT_CARDS.filter((c) => !used.has(c.id));
        if (unused.length === 0) return fail('十張事件卡都用完了，請結束遊戲', 409);
        cardId = unused[Math.floor(Math.random() * unused.length)].id;
      }

      const round = game.round + 1;
      const deadline = now + game.discussion_minutes * 60_000;
      await db.batch([
        db
          .prepare('INSERT INTO game_rounds (code, round, card_id, opened_at, deadline_at) VALUES (?, ?, ?, ?, ?)')
          .bind(game.code, round, cardId, now, deadline),
        db
          .prepare("UPDATE game_games SET status = 'discussing', round = ?, scoring_error = NULL, scoring_started_at = NULL, updated_at = ? WHERE code = ?")
          .bind(round, now, game.code),
      ]);
      return respond();
    }

    case 'extend': {
      if (game.status !== 'discussing') return fail('只有討論階段可以延長', 409);
      const minutes = clamp(Math.round(Number(body.minutes) || 2), 1, 30);
      const current = await db.prepare('SELECT deadline_at FROM game_rounds WHERE code = ? AND round = ?').bind(game.code, game.round).first();
      const base = Math.max(current?.deadline_at ?? now, now);
      await db
        .prepare('UPDATE game_rounds SET deadline_at = ? WHERE code = ? AND round = ?')
        .bind(base + minutes * 60_000, game.code, game.round)
        .run();
      return respond();
    }

    case 'score':
      return scoreCurrentRound(db, env, game, now);

    case 'manual_score': {
      if (!['discussing', 'scoring', 'results'].includes(game.status)) return fail('現在沒有可以評分的回合', 409);
      const teamId = String(body.teamId ?? '');
      const teams = await loadTeams(db, game.code);
      if (!teams.some((t) => t.id === teamId)) return fail('找不到這一組');
      const irrelevant = body.irrelevant === true;
      const deltas = irrelevant ? PENALTY_DELTAS : normalizeDeltas(body.deltas);
      const explanation = String(body.explanation ?? '').trim() || '（主持人手動評分）';
      await db
        .prepare(
          `INSERT INTO game_submissions (code, round, team_id, text, submitted_at, deltas, explanation, irrelevant, manual)
           VALUES (?, ?, ?, '', NULL, ?, ?, ?, 1)
           ON CONFLICT (code, round, team_id) DO UPDATE SET deltas = excluded.deltas, explanation = excluded.explanation, irrelevant = excluded.irrelevant, manual = 1`
        )
        .bind(game.code, game.round, teamId, JSON.stringify(deltas), explanation, irrelevant ? 1 : 0)
        .run();
      return respond();
    }

    case 'end': {
      await db.prepare("UPDATE game_games SET status = 'ended', updated_at = ? WHERE code = ?").bind(now, game.code).run();
      return respond();
    }

    case 'remove_team': {
      const teamId = String(body.teamId ?? '');
      await db.batch([
        db.prepare('DELETE FROM game_submissions WHERE code = ? AND team_id = ?').bind(game.code, teamId),
        db.prepare('DELETE FROM game_teams WHERE code = ? AND id = ?').bind(game.code, teamId),
      ]);
      return respond();
    }

    default:
      return fail('不認識的動作');
  }
}

/**
 * 評分這一回合：
 *   1. 把狀態切到 scoring（避免主持人連點兩次）
 *   2. 沒交的組補一筆空的，直接套懲罰
 *   3. 其他沒有分數的組一次送給 AI
 *   4. 全部有分數後，標記回合已評分、狀態切到 results
 * AI 失敗時狀態退回 discussing 並記下原因，主持人可以重試或手動評分。
 */
async function scoreCurrentRound(db, env, game, now) {
  if (game.status === 'scoring') {
    if (game.scoring_started_at && now - game.scoring_started_at < SCORING_STALE_MS) {
      return fail('AI 正在評分中，請稍等', 409);
    }
  } else if (game.status !== 'discussing') {
    return fail('現在不是可以評分的階段', 409);
  }

  await db
    .prepare("UPDATE game_games SET status = 'scoring', scoring_started_at = ?, scoring_error = NULL, updated_at = ? WHERE code = ?")
    .bind(now, now, game.code)
    .run();

  const card = CARD_BY_ID.get((await db.prepare('SELECT card_id FROM game_rounds WHERE code = ? AND round = ?').bind(game.code, game.round).first())?.card_id);
  if (!card) return fail('找不到這一回合的事件卡', 500);

  const teams = await loadTeams(db, game.code);
  const rounds = await loadRounds(db, game.code);
  const allSubs = await loadSubmissions(db, game.code);
  const subs = allSubs.filter((s) => s.round === game.round);

  const writes = [];
  const pending = [];
  const caps = new Map();
  for (const t of teams) {
    const sub = subs.find((s) => s.team_id === t.id);
    if (sub?.deltas) continue; // 已經有分數（AI 評過或主持人手動給過）
    const before = scoresBeforeRound(t, rounds, allSubs, game.round);
    caps.set(t.id, { budget: before.budget, cap: budgetCap(before) });
    const text = sub?.text?.trim() ?? '';
    if (!text) {
      writes.push(
        db
          .prepare(
            `INSERT INTO game_submissions (code, round, team_id, text, submitted_at, deltas, explanation, irrelevant)
             VALUES (?, ?, ?, '', NULL, ?, ?, 1)
             ON CONFLICT (code, round, team_id) DO UPDATE SET deltas = excluded.deltas, explanation = excluded.explanation, irrelevant = 1`
          )
          .bind(game.code, game.round, t.id, JSON.stringify(PENALTY_DELTAS), '這一組在期限內沒有提出任何政策。面對危機卻沒有決策，民眾會認為政府無能、沒有方向，各項資源都因此受損，選票與民眾健康掉得最多。')
      );
    } else {
      pending.push({ teamId: t.id, name: t.name, text, budget: before.budget, budgetCap: budgetCap(before) });
    }
  }

  let summary = null;
  if (pending.length > 0) {
    try {
      const scored = await scoreRound(env, { round: game.round, card, entries: pending });
      summary = scored.summary;
      for (const p of pending) {
        const r = scored.results.get(p.teamId);
        // AI 給的是 ±20 的基準分，這裡乘上放大倍率（創作者設定 1.5 倍）
        const deltas = r.irrelevant ? { ...PENALTY_DELTAS } : scaleDeltas(r.deltas);
        // 規則 3：選票低於 30 的組，預算支出不能超過上限（AI 已被告知，這裡再保險一次）
        const cap = caps.get(p.teamId)?.cap;
        if (!r.irrelevant && cap !== null && cap !== undefined && deltas.budget < -cap) deltas.budget = -cap;
        writes.push(
          db
            .prepare('UPDATE game_submissions SET deltas = ?, explanation = ?, irrelevant = ? WHERE code = ? AND round = ? AND team_id = ?')
            .bind(JSON.stringify(deltas), r.explanation, r.irrelevant ? 1 : 0, game.code, game.round, p.teamId)
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // 留在 Cloudflare 的即時日誌裡（wrangler pages deployment tail），方便查原因
      console.error('AI scoring failed:', message);
      await db
        .prepare("UPDATE game_games SET status = 'discussing', scoring_error = ?, updated_at = ? WHERE code = ?")
        .bind(message.slice(0, 500), Date.now(), game.code)
        .run();
      // 不用 502：Cloudflare 會把 502／504 換成它自己的錯誤頁，瀏覽器就只看得到「Failed to fetch」
      return fail(`AI 評分失敗：${message}`, 500);
    }
  }

  const done = Date.now();
  writes.push(
    db.prepare('UPDATE game_rounds SET scored_at = ?, summary = COALESCE(?, summary) WHERE code = ? AND round = ?').bind(done, summary, game.code, game.round),
    db.prepare("UPDATE game_games SET status = 'results', scoring_started_at = NULL, scoring_error = NULL, updated_at = ? WHERE code = ?").bind(done, game.code)
  );
  await db.batch(writes);

  return json(await buildState(db, await loadGame(db, game.code), { host: true, hostEnv: env }));
}
