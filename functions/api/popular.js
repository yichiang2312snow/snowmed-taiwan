/**
 * 熱門工具排行（近 30 天）
 *
 * GET /api/popular
 * 回傳每個工具近 30 天被打開幾次、完成幾次，由前端排序顯示。
 *
 * 資料來源是 /api/stats 已經在記的每日彙總（st:d:<日期>:tool:<工具>），
 * 純數字、不含任何個人資料。
 *
 * ── 為什麼這樣寫 ───────────────────────────────────────────
 * 免費方案的 KV 每天只能 list() 1,000 次。舊版每次快取沒命中就 list 60 次，
 * 而 Cache API 是每個機房各自一份，2026-09-16 在脆上分享後流量一衝，
 * 半天就把額度用完，連 /api/stats 報表都跟著壞掉。
 *
 * 現在完全不用 list()：工具清單直接拿 consts 的 TOOLS，逐一 get() 固定的 key。
 * 算好的結果另外存一份在 KV（pop:snapshot），全球共用，
 * 一小時才重算一次；各機房再用 Cache API 擋一層。
 * 出錯時回傳舊的結果（或空清單），並短暫快取，不會一直重試把額度打爆。
 */
import { TOOLS } from '../../src/consts';

const DAYS = 30;
const CACHE_SECONDS = 3600;
const ERROR_CACHE_SECONDS = 300;
const SNAPSHOT_KEY = 'pop:snapshot';

const SLUGS = TOOLS.map((t) => t.href.replace('/tools/', ''));

function json(data, maxAge = CACHE_SECONDS) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`,
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
    SLUGS.map(async (slug) => {
      const values = await Promise.all(days.map((day) => env.VIEWS.get(`st:d:${day}:${event}:${slug}`)));
      totals[slug] = values.reduce((s, v) => s + (Number.parseInt(v ?? '0', 10) || 0), 0);
    })
  );
  return totals;
}

async function compute(env) {
  const days = Array.from({ length: DAYS }, (_, i) => taipeiDay(i));
  const [opens, done] = await Promise.all([sumEvent(env, 'tool', days), sumEvent(env, 'done', days)]);

  const tools = SLUGS.map((id) => ({ id, opens: opens[id], done: done[id] }))
    .filter((t) => t.opens > 0 || t.done > 0)
    .sort((a, b) => b.opens - a.opens || b.done - a.done);
  const total = tools.reduce((s, t) => s + t.opens, 0);

  return {
    period: { from: days[days.length - 1], to: days[0], days: DAYS },
    total,
    tools,
    note: '近 30 天各工具被打開的次數，純彙總資料，不含任何個人識別資訊。',
  };
}

export async function onRequestGet({ request, env, waitUntil }) {
  if (!env.VIEWS) return json({ tools: [], total: 0 }, ERROR_CACHE_SECONDS);

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/popular', request.url).toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let snapshot = null;
  let res;
  try {
    snapshot = await env.VIEWS.get(SNAPSHOT_KEY, 'json');
    if (snapshot && Date.now() - snapshot.at < CACHE_SECONDS * 1000) {
      res = json(snapshot.data);
    } else {
      const data = await compute(env);
      await env.VIEWS.put(SNAPSHOT_KEY, JSON.stringify({ at: Date.now(), data }));
      res = json(data);
    }
  } catch {
    /* KV 額度用完或暫時故障：有舊資料就用舊的，沒有就回空清單（前端會安靜地不顯示） */
    res = json(snapshot?.data ?? { tools: [], total: 0 }, ERROR_CACHE_SECONDS);
  }

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
