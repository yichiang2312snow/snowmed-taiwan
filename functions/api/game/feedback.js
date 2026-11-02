/**
 * 體驗一題之後的玩家回饋
 *
 *   POST /api/game/feedback  { demoId?, fun, improve, name? }
 *     fun      這個遊戲好玩的地方
 *     improve  可以繼續改進的地方
 *     name     暱稱（選填）
 *
 * 兩欄至少填一欄。存在 game_feedback，主持人台（/admin/game）的「玩家回饋」區塊會列出來。
 * 同一個 IP 每小時最多 10 則，避免被灌。
 */

import { json, fail, readBody, charCount, randomToken, ensureDemoTables, clientIp } from './_lib.js';

const MAX_TEXT = 600;
const MAX_NAME = 20;
const HOUR = 60 * 60 * 1000;

const clean = (v) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').trim();

export async function onRequestPost({ request, env }) {
  const db = env.GAME_DB;
  if (!db) return fail('遊戲資料庫尚未設定', 503);
  await ensureDemoTables(db);

  const body = await readBody(request);
  const fun = clean(body.fun);
  const improve = clean(body.improve);
  const name = clean(body.name).slice(0, MAX_NAME);
  if (!fun && !improve) return fail('兩欄至少寫一欄，一句話也可以');
  if (charCount(fun) > MAX_TEXT || charCount(improve) > MAX_TEXT) return fail(`每一欄請在 ${MAX_TEXT} 字以內`);

  const now = Date.now();
  const ip = clientIp(request);
  const recent = await db.prepare('SELECT COUNT(*) AS c FROM game_feedback WHERE ip = ? AND created_at > ?').bind(ip, now - HOUR).first();
  if ((recent?.c ?? 0) >= 10) return fail('這個網路一小時內送出的回饋已經很多了，謝謝你！', 429);

  // demoId 只收我們自己發出的格式；對不上也沒關係，回饋照存
  const demoId = /^d_[0-9a-f]{12}$/.test(String(body.demoId ?? '')) ? String(body.demoId) : null;

  await db
    .prepare('INSERT INTO game_feedback (id, demo_id, ip, name, fun, improve, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(`f_${randomToken(6)}`, demoId, ip, name, fun, improve, now)
    .run();

  return json({ ok: true });
}
