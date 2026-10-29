/**
 * 讀取遊戲狀態（組長頁面與投影計分板都用這一支）
 *
 * GET /api/game/state?code=XXXX
 *   Authorization: Bearer <組長 token>   （可選；帶了就會附上自己這一組的草稿與結果）
 *
 * 沒帶 code 就回傳最新的一場（投影計分板用）。
 * 評分前看不到別組寫了什麼；評分後全部公開，方便課堂討論。
 */

import { json, fail, bearer, loadGame, buildState } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);

  const url = new URL(request.url);
  let code = (url.searchParams.get('code') ?? '').trim().toUpperCase();

  let teamId = null;
  const token = bearer(request);
  if (token) {
    const team = await db.prepare('SELECT id, code FROM game_teams WHERE token = ?').bind(token).first();
    if (team) {
      teamId = team.id;
      if (!code) code = team.code;
    } else {
      return json({ ok: false, error: 'team-not-found' }, 401);
    }
  }

  const game = await loadGame(db, code || null);
  if (!game) return json({ ok: false, error: 'no-game' }, 404);
  if (teamId) {
    // token 是別場的：告訴前端清掉重新加入
    const belongs = await db.prepare('SELECT 1 FROM game_teams WHERE id = ? AND code = ?').bind(teamId, game.code).first();
    if (!belongs) return json({ ok: false, error: 'team-not-found' }, 401);
  }

  return json(await buildState(db, game, { teamId }));
}
