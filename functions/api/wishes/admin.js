/**
 * 許願留言區的審核 API（只有你自己用得到）
 *
 * 需要在 Cloudflare Pages 的專案設定裡加一個 Secret：
 *   WISH_ADMIN_TOKEN = 一組你自己決定的長字串
 *
 * 用法（在終端機執行，或用任何 REST 工具）：
 *   列出全部（含待審）
 *     GET  /api/wishes/admin          Authorization: Bearer <TOKEN>
 *   通過 / 退回 / 刪除 / 加上你的回覆
 *     POST /api/wishes/admin          Authorization: Bearer <TOKEN>
 *     { "id": "...", "action": "approve" | "reject" | "delete", "reply": "選填" }
 *
 * 沒有設定 WISH_ADMIN_TOKEN 的話，這個端點會直接回 503，不會有預設密碼。
 */

const PREFIX = 'wish:';

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
  const expected = env.WISH_ADMIN_TOKEN;
  if (!expected) return { ok: false, res: json({ error: 'admin token not configured' }, 503) };

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!safeEqual(token, expected.trim())) return { ok: false, res: json({ error: 'unauthorized' }, 401) };

  return { ok: true };
}

async function findKey(env, id) {
  let cursor;
  do {
    const list = await env.VIEWS.list({ prefix: PREFIX, cursor });
    const hit = list.keys.find((k) => k.name.endsWith(`:${id}`));
    if (hit) return hit.name;
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);
  return null;
}

export async function onRequestGet({ request, env }) {
  const auth = authorize(request, env);
  if (!auth.ok) return auth.res;
  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  const wishes = [];
  let cursor;
  do {
    const list = await env.VIEWS.list({ prefix: PREFIX, cursor });
    for (const key of list.keys) {
      const raw = await env.VIEWS.get(key.name);
      if (!raw) continue;
      try {
        wishes.push(JSON.parse(raw));
      } catch {
        /* 壞掉的資料跳過 */
      }
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  wishes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return json({
    total: wishes.length,
    pending: wishes.filter((w) => w.status === 'pending').length,
    approved: wishes.filter((w) => w.status === 'approved').length,
    wishes,
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
  if (!['approve', 'reject', 'delete'].includes(action)) {
    return json({ error: 'action must be approve, reject or delete' }, 400);
  }

  const key = await findKey(env, id);
  if (!key) return json({ error: 'not found' }, 404);

  if (action === 'delete') {
    await env.VIEWS.delete(key);
    return json({ ok: true, id, action });
  }

  const raw = await env.VIEWS.get(key);
  const wish = JSON.parse(raw);
  wish.status = action === 'approve' ? 'approved' : 'rejected';
  wish.reviewedAt = new Date().toISOString();
  if (typeof body.reply === 'string') wish.reply = body.reply.trim() || null;

  await env.VIEWS.put(key, JSON.stringify(wish));
  return json({ ok: true, id, status: wish.status });
}
