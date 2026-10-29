/**
 * 組長加入遊戲
 *
 * POST /api/game/join  { code, name }
 *   → { ok, teamId, token, code, name }
 *
 * 只有主持人開了大廳（遊戲存在且還沒結束）才能加入；最多 10 組。
 * 回傳的 token 存在組長的瀏覽器，之後讀狀態、交政策都靠它。
 */

import { json, fail, readBody, loadGame, loadTeams, randomToken, charCount, MAX_TEAMS } from './_lib.js';

export async function onRequestPost({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);

  const body = await readBody(request);
  const code = String(body.code ?? '').trim().toUpperCase();
  const name = String(body.name ?? '').trim().replace(/\s+/g, ' ');

  if (!/^[A-Z0-9]{4,12}$/.test(code)) return fail('入場密碼格式不對（4～12 個英文字母或數字）');
  if (!name) return fail('請輸入組名');
  if (charCount(name) > 12) return fail('組名請在 12 個字以內');

  const game = await loadGame(db, code);
  if (!game) return fail('入場密碼不對，或主持人還沒開啟遊戲大廳', 404);
  if (game.status === 'ended') return fail('這一場遊戲已經結束了', 410);

  const teams = await loadTeams(db, code);
  if (teams.some((t) => t.name === name)) return fail('這個組名已經有人用了，換一個吧', 409);
  if (teams.length >= MAX_TEAMS) return fail(`這一場已經滿 ${MAX_TEAMS} 組了`, 409);

  const id = `t_${randomToken(6)}`;
  const token = randomToken(24);
  try {
    await db
      .prepare('INSERT INTO game_teams (id, code, name, token, joined_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, code, name, token, Date.now())
      .run();
  } catch {
    // 幾乎同時有兩組用同一個組名時，UNIQUE 會擋下第二個
    return fail('這個組名剛剛被別組用掉了，換一個吧', 409);
  }

  return json({ ok: true, teamId: id, token, code, name });
}
