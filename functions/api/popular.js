/**
 * 熱門工具排行（近 30 天）
 *
 * GET /api/popular
 * 回傳每個工具近 30 天被打開幾次、完成幾次，由前端排序顯示。
 *
 * 資料來源是 /api/stats 已經在記的每日彙總（st:d:<日期>:tool:<工具>），
 * 純數字、不含任何個人資料。結果用 Cache API 快取一小時，
 * KV 每小時最多被讀一次，不會因為首頁流量把讀取次數撐爆。
 */

const DAYS = 30;
const CACHE_SECONDS = 3600;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_SECONDS}`,
    },
  });
}

/** 台北時間的 YYYY-MM-DD，跟 stats.js 的寫法一致 */
function taipeiDay(offsetDays) {
  const t = new Date(Date.now() + 8 * 60 * 60 * 1000 - offsetDays * 24 * 60 * 60 * 1000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

async function sumEvent(env, event, days) {
  const totals = {};
  await Promise.all(
    days.map(async (day) => {
      const prefix = `st:d:${day}:${event}:`;
      let cursor;
      do {
        const list = await env.VIEWS.list({ prefix, cursor });
        await Promise.all(
          list.keys.map(async (k) => {
            const slug = k.name.slice(prefix.length);
            if (!/^[a-z0-9-]{1,40}$/.test(slug)) return;
            const n = Number.parseInt((await env.VIEWS.get(k.name)) ?? '0', 10) || 0;
            totals[slug] = (totals[slug] ?? 0) + n;
          })
        );
        cursor = list.list_complete ? undefined : list.cursor;
      } while (cursor);
    })
  );
  return totals;
}

export async function onRequestGet({ request, env }) {
  if (!env.VIEWS) return json({ tools: [], total: 0 });

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/popular', request.url).toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const days = Array.from({ length: DAYS }, (_, i) => taipeiDay(i));
  const [opens, done] = await Promise.all([sumEvent(env, 'tool', days), sumEvent(env, 'done', days)]);

  const slugs = new Set([...Object.keys(opens), ...Object.keys(done)]);
  const tools = [...slugs]
    .map((id) => ({ id, opens: opens[id] ?? 0, done: done[id] ?? 0 }))
    .sort((a, b) => b.opens - a.opens || b.done - a.done);
  const total = tools.reduce((s, t) => s + t.opens, 0);

  const res = json({
    period: { from: days[days.length - 1], to: days[0], days: DAYS },
    total,
    tools,
    note: '近 30 天各工具被打開的次數，純彙總資料，不含任何個人識別資訊。',
  });
  await cache.put(cacheKey, res.clone());
  return res;
}
