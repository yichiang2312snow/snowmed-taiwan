/**
 * 本季瀏覽人次（公開，不需要 token）
 *
 * GET /api/season
 * 回傳這個雪季到目前為止的頁面瀏覽次數、逐月明細，以及累計造訪人數。
 *
 * ── 雪季怎麼算 ─────────────────────────────────────────────
 * 以 9 月 1 日為一季的起點：台灣雪友的行前體能準備從秋天就開始，
 * 到隔年 8 月底結束，剛好涵蓋「準備 → 滑雪 → 回歸」一整個循環，
 * 也跟這個站的工具設計一致。所以 2026-09 ～ 2027-08 算「2026–27 雪季」。
 *
 * ── 為什麼用增量快取 ───────────────────────────────────────
 * 免費方案的 KV 每天 list() 1,000 次、讀取 10 萬次。
 * 每次都把整季的每日鍵掃一遍，到季末會有上萬個鍵，一天重算幾次就吃掉大半額度
 * （2026-09 就因為 /api/popular 每次都 list 把額度用完過一次）。
 *
 * 但「過去的某一天」一旦過完就不會再變，所以快照只存每日數字，
 * 重算時只補「還沒定案的那幾天」（今天，以及上次算完之後漏掉的日子），
 * 平常一次重算只要 1 次 list + 二十幾次 get。
 * 前面再用 Cache API 擋一層，各機房一小時才回源一次。
 */

const CACHE_SECONDS = 3600; // 邊緣快取 1 小時
const ERROR_CACHE_SECONDS = 300;
const REFRESH_MS = 30 * 60 * 1000; // 快照超過 30 分鐘才重算
const SNAPSHOT_KEY = 'season:snapshot';

function json(data, maxAge = CACHE_SECONDS) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`,
    },
  });
}

/** 台北時間的今天（YYYY-MM-DD），跟 stats.js 的算法一致 */
function taipeiToday() {
  const t = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** 某一天屬於哪一個雪季，回傳 { id:'2026-27', from:'2026-09-01', to:'2027-08-31' } */
function seasonOf(day) {
  const [y, m] = day.split('-').map(Number);
  const start = m >= 9 ? y : y - 1;
  return {
    id: `${start}-${String((start + 1) % 100).padStart(2, '0')}`,
    from: `${start}-09-01`,
    to: `${start + 1}-08-31`,
  };
}

/** 從 from 到 to（含）的每一天 */
function daysBetween(from, to) {
  const out = [];
  const end = Date.parse(to + 'T00:00:00Z');
  for (let t = Date.parse(from + 'T00:00:00Z'); t <= end; t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/** 某一天所有頁面的瀏覽次數加總 */
async function viewsOn(env, day) {
  let total = 0;
  let cursor;
  do {
    const list = await env.VIEWS.list({ prefix: `st:d:${day}:view:`, cursor });
    const values = await Promise.all(list.keys.map((k) => env.VIEWS.get(k.name)));
    for (const v of values) total += Number.parseInt(v ?? '0', 10) || 0;
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);
  return total;
}

/**
 * 把快照補到今天。
 * 只重算「還沒定案」的日子 —— 已經過完的日子數字不會再變，直接沿用。
 */
async function refresh(env, snapshot, today) {
  const season = seasonOf(today);
  const fresh = !snapshot || snapshot.season !== season.id;
  const days = fresh ? {} : { ...snapshot.days };

  // 第一次（或跨季）要把整季補齊；平常只補上次算到的那天之後
  const from = fresh ? season.from : (snapshot.through ?? season.from);
  for (const day of daysBetween(from, today)) {
    days[day] = await viewsOn(env, day);
  }

  return { season: season.id, from: season.from, to: season.to, through: today, days, at: Date.now() };
}

/** 快照 → 回傳給前端的格式 */
function shape(snapshot, visitors) {
  const byMonth = {};
  let views = 0;
  for (const [day, n] of Object.entries(snapshot.days)) {
    if (!n) continue;
    views += n;
    const m = day.slice(0, 7);
    byMonth[m] = (byMonth[m] ?? 0) + n;
  }
  return {
    season: snapshot.season,
    from: snapshot.from,
    to: snapshot.to,
    updatedAt: snapshot.at,
    views,
    visitors,
    byMonth: Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, n]) => ({ month, views: n })),
    note: '純彙總資料，不含任何個人識別資訊。',
  };
}

export async function onRequestGet({ request, env, waitUntil }) {
  if (!env.VIEWS) return json({ views: 0, visitors: 0, byMonth: [] }, ERROR_CACHE_SECONDS);

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/season', request.url).toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const today = taipeiToday();
  let snapshot = null;
  let res;

  try {
    snapshot = await env.VIEWS.get(SNAPSHOT_KEY, 'json');
    const visitors = Number.parseInt((await env.VIEWS.get('visits:total')) ?? '0', 10) || 0;

    if (snapshot && snapshot.season === seasonOf(today).id && Date.now() - snapshot.at < REFRESH_MS) {
      res = json(shape(snapshot, visitors));
    } else {
      const next = await refresh(env, snapshot, today);
      await env.VIEWS.put(SNAPSHOT_KEY, JSON.stringify(next));
      res = json(shape(next, visitors));
    }
  } catch {
    /* KV 額度用完或暫時故障：有舊快照就用舊的，沒有就回 0（前端會安靜地不顯示） */
    res = json(
      snapshot ? shape(snapshot, 0) : { views: 0, visitors: 0, byMonth: [] },
      ERROR_CACHE_SECONDS
    );
  }

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
