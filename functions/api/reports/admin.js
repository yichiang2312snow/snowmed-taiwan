/**
 * 雪場即時狀況回饋單的管理 API（只有你自己用得到）
 *
 * 回報是即時公開的，所以這裡的重點是「事後可以刪」：
 * 看到不實、灌水或不當的內容，用這個端點刪掉，前台馬上就不見了。
 *
 * 需要在 Cloudflare Pages 的專案設定裡加一個 Secret：
 *   REPORT_ADMIN_TOKEN = 一組你自己決定的長字串
 *   （沒設的話會沿用許願區的 WISH_ADMIN_TOKEN，兩個都沒有就回 503，不會有預設密碼）
 *
 * 用法：
 *   列出目前公開的回報
 *     GET  /api/reports/admin          Authorization: Bearer <TOKEN>
 *   刪掉一則
 *     POST /api/reports/admin          Authorization: Bearer <TOKEN>
 *     { "id": "...", "action": "delete" }
 */

const ITEM_PREFIX = 'rpt:i:';
const FEED_KEY = 'rpt:feed';

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/** 固定時間比較，避免用回應時間猜 token */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorize(request, env) {
  const expected = env.REPORT_ADMIN_TOKEN ?? env.WISH_ADMIN_TOKEN;
  if (!expected) return { ok: false, res: json({ error: 'admin token not configured' }, 503) };

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!safeEqual(token, expected.trim())) {
    return { ok: false, res: json({ error: 'unauthorized' }, 401) };
  }
  return { ok: true };
}

async function readFeed(env) {
  const raw = await env.VIEWS.get(FEED_KEY);
  if (!raw) return [];
  try {
    const feed = JSON.parse(raw);
    return Array.isArray(feed) ? feed : [];
  } catch {
    return [];
  }
}

export async function onRequestGet({ request, env }) {
  const auth = authorize(request, env);
  if (!auth.ok) return auth.res;
  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  const feed = await readFeed(env);
  return json({ total: feed.length, reports: feed });
}

export async function onRequestPost({ request, env }) {
  const auth = authorize(request, env);
  if (!auth.ok) return auth.res;
  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const id = String(body.id ?? '');
  const action = String(body.action ?? '');
  if (!id) return json({ error: 'id required' }, 400);
  if (action !== 'delete') return json({ error: 'action must be delete' }, 400);

  // 先從前台清單移除（使用者看到的就是這份）
  const feed = await readFeed(env);
  const next = feed.filter((r) => r && r.id !== id);
  const removed = next.length !== feed.length;
  if (removed) await env.VIEWS.put(FEED_KEY, JSON.stringify(next));

  // 再刪掉單筆備份。這裡才需要 list()，但只有你手動刪除時才會跑到。
  let cursor;
  do {
    const list = await env.VIEWS.list({ prefix: ITEM_PREFIX, cursor });
    const hit = list.keys.find((k) => k.name.endsWith(`:${id}`));
    if (hit) {
      await env.VIEWS.delete(hit.name);
      break;
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return json({ ok: true, id, removedFromFeed: removed });
}
