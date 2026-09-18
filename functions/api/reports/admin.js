/**
 * 雪場即時狀況回饋單的管理 API（只有你自己用得到）
 *
 * 兩件事：
 * 1. 審核照片 —— 有附照片的回報，文字照樣即時公開，但照片要核准才會出現。
 * 2. 事後刪除 —— 看到不實、灌水或不當的內容就刪掉，前台馬上就不見了。
 *
 * 有畫面的版本在 /admin/reports，這個端點是它的後端；用 curl 也可以。
 *
 * 需要在 Cloudflare Pages 的專案設定裡加一個 Secret：
 *   REPORT_ADMIN_TOKEN = 一組你自己決定的長字串
 *   （沒設的話會沿用許願區的 WISH_ADMIN_TOKEN，兩個都沒有就回 503，不會有預設密碼）
 *
 * 用法：
 *   列出待審照片與目前公開的回報
 *     GET  /api/reports/admin          Authorization: Bearer <TOKEN>
 *   核准照片 / 退掉照片（只刪照片，文字留著）/ 刪掉整則
 *     POST /api/reports/admin          Authorization: Bearer <TOKEN>
 *     { "id": "...", "action": "approve-photo" | "reject-photo" | "delete" }
 */

const ITEM_PREFIX = 'rpt:i:';
const FEED_KEY = 'rpt:feed';
const PENDING_KEY = 'rpt:pending';
const IMAGE_PREFIX = 'rptimg:';

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

async function readJsonArray(env, key) {
  const raw = await env.VIEWS.get(key);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const readFeed = (env) => readJsonArray(env, FEED_KEY);
const readPending = (env) => readJsonArray(env, PENDING_KEY);

export async function onRequestGet({ request, env }) {
  const auth = authorize(request, env);
  if (!auth.ok) return auth.res;
  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  const [feed, pending] = await Promise.all([readFeed(env), readPending(env)]);

  // 佇列裡可能有已經處理過（核准、退回或整則刪掉）的，以前台清單的狀態為準
  const stillPending = pending.filter((p) => {
    const live = feed.find((r) => r && r.id === p.id);
    return live ? live.photo === 'pending' : false;
  });

  return json({
    total: feed.length,
    pendingCount: stillPending.length,
    pending: stillPending,
    reports: feed,
  });
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
  if (!['approve-photo', 'reject-photo', 'delete'].includes(action)) {
    return json({ error: 'action must be approve-photo, reject-photo or delete' }, 400);
  }

  const [feed, pending] = await Promise.all([readFeed(env), readPending(env)]);
  const nextPending = pending.filter((p) => p && p.id !== id);

  // 照片審核：只動前台清單那一筆的 photo 欄位，照片本體的網址不變
  if (action !== 'delete') {
    const hit = feed.find((r) => r && r.id === id);
    if (!hit) return json({ error: 'not found' }, 404);

    hit.photo = action === 'approve-photo' ? 'approved' : null;

    const writes = [
      env.VIEWS.put(FEED_KEY, JSON.stringify(feed)),
      env.VIEWS.put(PENDING_KEY, JSON.stringify(nextPending)),
    ];
    // 退回的照片沒有留著的必要，直接刪掉
    if (action === 'reject-photo') writes.push(env.VIEWS.delete(`${IMAGE_PREFIX}${id}`));
    await Promise.all(writes);

    return json({ ok: true, id, photo: hit.photo });
  }

  // 整則刪除：前台清單、待審佇列、照片、單筆備份都清掉
  const next = feed.filter((r) => r && r.id !== id);
  const removed = next.length !== feed.length;

  await Promise.all([
    removed ? env.VIEWS.put(FEED_KEY, JSON.stringify(next)) : Promise.resolve(),
    nextPending.length !== pending.length
      ? env.VIEWS.put(PENDING_KEY, JSON.stringify(nextPending))
      : Promise.resolve(),
    env.VIEWS.delete(`${IMAGE_PREFIX}${id}`),
  ]);

  // 單筆備份要找 key 才刪得掉。這裡才需要 list()，但只有你手動刪除時才會跑到。
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
