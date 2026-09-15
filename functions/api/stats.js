/**
 * 使用統計（純彙總，不記錄任何個人資料）
 *
 * POST /api/stats   前端回報一個事件，對應的計數 +1
 * GET  /api/stats   讀取彙總資料（需要 Bearer token）
 *                   ?month=YYYY-MM 某月、?day=YYYY-MM-DD 某天、?range=all 全部月份（含逐月明細）
 *
 * ── 這裡「不」做的事 ───────────────────────────────────────
 * 不放 cookie、不記錄 IP（連雜湊都不存）、不產生任何 session 或訪客識別碼。
 * KV 裡只有「某一天 / 某個月，某個事件發生了幾次」這種數字，
 * 沒有任何欄位可以把兩次造訪連在一起，也無法回推是誰。
 *
 * 所以網站上「不收集個資、不做追蹤」的說明依然成立。
 */

const DAY_TTL = 60 * 60 * 24 * 400; // 日資料留約 13 個月，月彙總永久保留

/** 允許的事件類型。沒在清單上的一律丟掉，避免被灌入任意資料 */
const EVENTS = new Set([
  'view', // 瀏覽頁面，label = 路徑
  'tool', // 打開某個工具，label = 工具代號
  'done', // 完成某個工具並看到結果，label = 工具代號
  'result', // 工具的結果類別，label = 工具代號/結果
  'wish', // 送出許願
  'vote', // 雪友投票，label = 題目/選項
]);

/** label 只允許這些字元，長度也限制，避免有人塞垃圾進來 */
const LABEL_RE = /^[a-z0-9/_-]{1,60}$/;

function json(data, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
    },
  });
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 以台北時間計算日期，報表才會跟他的生活作息對得上 */
function taipeiParts(now = new Date()) {
  const tz = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const y = tz.getUTCFullYear();
  const m = String(tz.getUTCMonth() + 1).padStart(2, '0');
  const d = String(tz.getUTCDate()).padStart(2, '0');
  return { day: `${y}-${m}-${d}`, month: `${y}-${m}` };
}

async function bump(env, key, ttl) {
  const cur = Number.parseInt((await env.VIEWS.get(key)) ?? '0', 10) || 0;
  const opts = ttl ? { expirationTtl: ttl } : undefined;
  await env.VIEWS.put(key, String(cur + 1), opts);
}

export async function onRequestPost({ request, env }) {
  if (!env.VIEWS) return json({ ok: false }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const event = String(body.e ?? '');
  const label = String(body.l ?? '').toLowerCase();

  if (!EVENTS.has(event) || !LABEL_RE.test(label)) return json({ ok: false }, 400);

  const { day, month } = taipeiParts();

  try {
    await bump(env, `st:d:${day}:${event}:${label}`, DAY_TTL);
    await bump(env, `st:m:${month}:${event}:${label}`, undefined);
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

  const url = new URL(request.url);
  // ?month=2026-09 取某個月的彙總；?day=2026-09-12 取某一天；?range=all 取全部月份；預設為本月
  const month = url.searchParams.get('month');
  const day = url.searchParams.get('day');
  const all = url.searchParams.get('range') === 'all';
  const prefix = all ? 'st:m:' : day ? `st:d:${day}:` : `st:m:${month ?? taipeiParts().month}:`;

  const counts = {};
  const byMonth = {};
  let cursor;
  do {
    const list = await env.VIEWS.list({ prefix, cursor });
    await Promise.all(
      list.keys.map(async (key) => {
        let rest = key.name.slice(prefix.length); // [YYYY-MM:]event:label
        let m = null;
        if (all) {
          const j = rest.indexOf(':');
          if (j < 0) return;
          m = rest.slice(0, j);
          rest = rest.slice(j + 1);
        }
        const i = rest.indexOf(':');
        if (i < 0) return;
        const event = rest.slice(0, i);
        const label = rest.slice(i + 1);
        const n = Number.parseInt((await env.VIEWS.get(key.name)) ?? '0', 10) || 0;
        counts[event] ??= {};
        counts[event][label] = (counts[event][label] ?? 0) + n;
        if (m) {
          byMonth[m] ??= {};
          byMonth[m][event] ??= {};
          byMonth[m][event][label] = n;
        }
      })
    );
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  const visits = Number.parseInt((await env.VIEWS.get('visits:total')) ?? '0', 10) || 0;

  return json({
    scope: all ? { range: 'all' } : day ? { day } : { month: month ?? taipeiParts().month },
    totalVisitorsAllTime: visits,
    counts,
    ...(all ? { byMonth } : {}),
    note: '純彙總資料，不含任何個人識別資訊。',
  });
}
