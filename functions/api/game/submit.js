/**
 * 組長送出（或修改）這一回合的政策
 *
 * POST /api/game/submit  { text }
 *   Authorization: Bearer <組長 token>
 *
 * 討論階段都可以改，主持人按下評分之後就鎖定。
 * 字數上限 80 字（以 Unicode 字元計，見 policyGameResources.ts 的 MAX_POLICY_CHARS）。
 */

import { json, fail, bearer, readBody, loadGame, charCount, MAX_POLICY_CHARS } from './_lib.js';

export async function onRequestPost({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);

  const token = bearer(request);
  if (!token) return fail('請先加入遊戲', 401);
  const team = await db.prepare('SELECT id, code, name FROM game_teams WHERE token = ?').bind(token).first();
  if (!team) return fail('找不到你這一組，請重新加入', 401);

  const game = await loadGame(db, team.code);
  if (!game) return fail('遊戲不存在', 404);
  if (game.status !== 'discussing') return fail('現在不是討論時間，無法送出政策', 409);

  const body = await readBody(request);
  const text = String(body.text ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return fail('政策內容不能是空的');
  if (charCount(text) > MAX_POLICY_CHARS) return fail(`政策說明請在 ${MAX_POLICY_CHARS} 字以內`);

  // 這一回合是否已經被評分（理論上 status 擋掉了，但多一道保險）
  const existing = await db
    .prepare('SELECT deltas FROM game_submissions WHERE code = ? AND round = ? AND team_id = ?')
    .bind(game.code, game.round, team.id)
    .first();
  if (existing?.deltas) return fail('這一回合已經評分了', 409);

  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO game_submissions (code, round, team_id, text, submitted_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (code, round, team_id) DO UPDATE SET text = excluded.text, submitted_at = excluded.submitted_at`
    )
    .bind(game.code, game.round, team.id, text, now)
    .run();

  return json({ ok: true, text, submittedAt: now });
}
