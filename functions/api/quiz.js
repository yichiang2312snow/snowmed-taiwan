/**
 * 複習測驗的作答統計
 *
 * POST /api/quiz        前端做完十題後回報一次
 * GET  /api/quiz        讀取彙總（需要 Bearer token）
 *
 * ── 為什麼不用 /api/stats ──────────────────────────────────
 * 用現成的事件計數器也做得到，但每題要送一個事件，一次測驗就是 11 次 KV 寫入。
 * 免費方案一天只有 1,000 次寫入，2026-09 已經因為類似的寫法撞過一次上限。
 * 所以這裡把整份作答結果收成一個請求，讀一次、改一次、寫一次，
 * 不管十題還是五十題，一次測驗都只花一次寫入。
 *
 * ── 併發的取捨 ────────────────────────────────────────────
 * 讀取—修改—寫回沒有鎖，兩個人同時交卷有可能其中一筆被蓋掉。
 * 這個站的量級（一天個位數到數十次）發生機率很低，而且損失的只是統計數字，
 * 不值得為它加上分散式鎖或改用 Durable Object。
 *
 * ── 隱私 ──────────────────────────────────────────────────
 * 只累加「某一題被作答幾次、答對幾次」與「幾分的人有幾個」。
 * 不放 cookie、不記錄 IP、不存任何可以把兩次作答連在一起的識別碼。
 */

import { isBotRequest } from './_bot.js';
// 題庫直接從前端那一份讀，後台就不用再複製一份題目文字（複製遲早會對不上）
import { QUIZ_QUESTIONS, CATEGORY_LABELS } from '../../src/data/quizQuestions';

const KEY = 'quiz:stats';
const MAX_ANSWERS = 50;
/** 題目 id 的格式，跟 src/data/quizQuestions.ts 一致（例如 b1、e12、s4） */
const ID_RE = /^[a-z]{1,2}\d{1,2}$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const empty = () => ({ plays: 0, scores: {}, questions: {}, updatedAt: 0 });

export async function onRequestPost({ request, env }) {
  if (!env.VIEWS) return json({ ok: false }, 503);

  // 爬蟲不會真的作答，但會執行 JS；不擋的話答對率會被灌水
  if (isBotRequest(request)) return json({ ok: true });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const answers = Array.isArray(body.answers) ? body.answers : null;
  if (!answers || answers.length === 0 || answers.length > MAX_ANSWERS) return json({ ok: false }, 400);

  // 只收格式正確的題目 id，避免有人灌入任意字串把 KV 撐爆
  const clean = [];
  for (const a of answers) {
    const id = String(a?.id ?? '');
    if (!ID_RE.test(id)) return json({ ok: false }, 400);
    clean.push({ id, ok: a.ok === true });
  }

  const score = Number.isInteger(body.score) ? body.score : clean.filter((a) => a.ok).length;
  if (score < 0 || score > clean.length) return json({ ok: false }, 400);

  try {
    const stats = (await env.VIEWS.get(KEY, 'json')) ?? empty();

    stats.plays = (stats.plays ?? 0) + 1;
    stats.scores ??= {};
    stats.scores[score] = (stats.scores[score] ?? 0) + 1;
    stats.questions ??= {};
    for (const a of clean) {
      const q = (stats.questions[a.id] ??= { seen: 0, correct: 0 });
      q.seen += 1;
      if (a.ok) q.correct += 1;
    }
    stats.updatedAt = Date.now();

    await env.VIEWS.put(KEY, JSON.stringify(stats));
  } catch {
    /* 統計失敗不該影響使用者，安靜地忽略 */
  }

  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const expected = env.WISH_ADMIN_TOKEN;
  if (!expected) return json({ error: 'admin token not configured' }, 503);

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!safeEqual(token, expected.trim())) return json({ error: 'unauthorized' }, 401);

  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  const stats = (await env.VIEWS.get(KEY, 'json')) ?? empty();

  // 把計數跟題目文字兜起來，答對率低的排前面 —— 那就是大家最沒吸收到的觀念
  const questions = QUIZ_QUESTIONS.map((q) => {
    const hit = stats.questions?.[q.id] ?? { seen: 0, correct: 0 };
    return {
      id: q.id,
      q: q.q,
      category: CATEGORY_LABELS[q.category],
      seen: hit.seen,
      correct: hit.correct,
      rate: hit.seen > 0 ? Math.round((hit.correct / hit.seen) * 1000) / 10 : null,
      source: q.source,
    };
  }).sort((a, b) => {
    if (a.seen === 0 && b.seen === 0) return 0;
    if (a.seen === 0) return 1;
    if (b.seen === 0) return -1;
    return a.rate - b.rate;
  });

  const totalAnswers = questions.reduce((n, q) => n + q.seen, 0);
  const totalCorrect = questions.reduce((n, q) => n + q.correct, 0);

  return json({
    plays: stats.plays ?? 0,
    scores: stats.scores ?? {},
    updatedAt: stats.updatedAt ?? 0,
    totalAnswers,
    overallRate: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 1000) / 10 : null,
    questions,
    note: '純彙總資料，不含任何個人識別資訊。',
  });
}

/**
 * DELETE /api/quiz   把統計歸零（需要 Bearer token）
 *
 * 存在的理由：上線前自己試玩的那幾局會混進真實數字裡，要有辦法清掉。
 * 只能整份歸零，不能只刪某一局 —— 這裡從頭到尾只存計數（某題被答幾次、
 * 幾分的人有幾個），沒有逐筆紀錄可以挑出來刪，這是刻意的隱私設計。
 */
export async function onRequestDelete({ request, env }) {
  const expected = env.WISH_ADMIN_TOKEN;
  if (!expected) return json({ error: 'admin token not configured' }, 503);

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!safeEqual(token, expected.trim())) return json({ error: 'unauthorized' }, 401);

  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  await env.VIEWS.delete(KEY);
  return json({ ok: true, reset: true });
}
