/**
 * 熱門工具排行（上線至今）
 *
 * GET /api/popular
 * 回傳每個工具從網站上線到現在被打開幾次、完成幾次，由前端排序顯示。
 *
 * 資料來源是 /api/stats 已經在記的每日彙總（st:d:<日期>:tool:<工具>），
 * 純數字、不含任何個人資料。
 *
 * ── 為什麼不用 list() ──────────────────────────────────────
 * 免費方案的 KV 每天只能 list() 1,000 次。舊版每次快取沒命中就 list 60 次，
 * 而 Cache API 是每個機房各自一份，2026-09-16 在脆上分享後流量一衝，
 * 半天就把額度用完，連 /api/stats 報表都跟著壞掉。
 * 所以這裡完全不 list：工具清單直接拿 consts 的 TOOLS，逐一 get() 固定的 key。
 *
 * ── 為什麼要累加，不每次重算 ───────────────────────────────
 * 改成「上線至今」之後，天數只會愈來愈多。每小時把所有日子重算一次的話，
 * 一年後每次重算要讀上萬個 key，遲早又會撞到額度。
 *
 * 所以快照存的是「累計到某一天為止的數字」(through)：重算時只補上還沒算過的
 * 完整日子，再把今天單獨讀一次加上去（今天還會變，不能寫進累計）。
 * 穩定狀態下每次重算只讀今天的 26 個 key，跟上線多久完全無關。
 */
import { TOOLS } from '../../src/consts';

/** 最早有統計資料的日子。再往前沒有任何 st:d: 鍵 */
const START = '2026-09-01';
const CACHE_SECONDS = 3600;
const ERROR_CACHE_SECONDS = 300;
const SNAPSHOT_KEY = 'pop:snapshot';
/** 快照格式版本。改格式時加一，舊快照會自動整個重算 */
const SNAPSHOT_VERSION = 2;
/** 一次重算最多補幾天，避免極端情況（例如很久沒人造訪）一次讀太多 key */
const MAX_CATCHUP_DAYS = 120;

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

/** 從 from 的「隔天」列到 to（含），兩邊都是 YYYY-MM-DD */
function daysBetween(fromExclusive, toInclusive) {
  const out = [];
  const cur = new Date(`${fromExclusive}T00:00:00Z`);
  const end = new Date(`${toInclusive}T00:00:00Z`);
  for (;;) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    if (cur > end || out.length >= MAX_CATCHUP_DAYS) break;
    out.push(cur.toISOString().slice(0, 10));
  }
  return out;
}

const emptyTotals = () => Object.fromEntries(SLUGS.map((id) => [id, { opens: 0, done: 0 }]));

/** 把這幾天的數字加進 totals（會就地修改） */
async function addDays(env, totals, days) {
  if (days.length === 0) return;
  await Promise.all(
    SLUGS.map(async (slug) => {
      const [opens, done] = await Promise.all([
        Promise.all(days.map((d) => env.VIEWS.get(`st:d:${d}:tool:${slug}`))),
        Promise.all(days.map((d) => env.VIEWS.get(`st:d:${d}:done:${slug}`))),
      ]);
      const sum = (arr) => arr.reduce((s, v) => s + (Number.parseInt(v ?? '0', 10) || 0), 0);
      totals[slug].opens += sum(opens);
      totals[slug].done += sum(done);
    })
  );
}

function shape(totals, today) {
  const tools = SLUGS.map((id) => ({ id, opens: totals[id].opens, done: totals[id].done }))
    .filter((t) => t.opens > 0 || t.done > 0)
    .sort((a, b) => b.opens - a.opens || b.done - a.done);

  return {
    period: { from: START, to: today, allTime: true },
    total: tools.reduce((s, t) => s + t.opens, 0),
    tools,
    note: '網站上線至今各工具被打開的次數，純彙總資料，不含任何個人識別資訊。',
  };
}

/**
 * 回傳 { data, snapshot }。snapshot 是要寫回 KV 的新快照；
 * 今天的數字不寫進累計，因為今天還沒過完。
 */
async function compute(env, previous) {
  const today = taipeiDay(0);
  const yesterday = taipeiDay(1);

  const usable = previous?.v === SNAPSHOT_VERSION && previous.through && previous.totals;
  const totals = usable ? previous.totals : emptyTotals();
  // 補齊缺的工具（consts 新增工具時舊快照不會有那一筆）
  for (const id of SLUGS) totals[id] ??= { opens: 0, done: 0 };

  // 第一次算：從上線那天的前一天開始補；之後：從已累計的隔天補到昨天
  const from = usable ? previous.through : shiftDay(START, -1);
  const days = daysBetween(from, yesterday);
  await addDays(env, totals, days);
  // 只能宣稱累計到「真的加進去的最後一天」—— 被 MAX_CATCHUP_DAYS 截斷時，
  // 剩下的日子留給下一次重算補，不然會整段被跳過。
  const through = days.length > 0 ? days[days.length - 1] : from;

  // 今天單獨算，不寫進累計
  const live = structuredClone(totals);
  await addDays(env, live, [today]);

  return {
    data: shape(live, today),
    snapshot: { v: SNAPSHOT_VERSION, at: Date.now(), through, totals },
  };
}

/** YYYY-MM-DD 往前／往後幾天 */
function shiftDay(day, delta) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
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
    if (snapshot?.v === SNAPSHOT_VERSION && snapshot.data && Date.now() - snapshot.at < CACHE_SECONDS * 1000) {
      res = json(snapshot.data);
    } else {
      const { data, snapshot: next } = await compute(env, snapshot);
      // data 一起存：下一個機房快取沒命中時可以直接用，不必再算一次
      await env.VIEWS.put(SNAPSHOT_KEY, JSON.stringify({ ...next, data }));
      res = json(data);
    }
  } catch {
    /* KV 額度用完或暫時故障：有舊資料就用舊的，沒有就回空清單（前端會安靜地不顯示） */
    res = json(snapshot?.data ?? { tools: [], total: 0 }, ERROR_CACHE_SECONDS);
  }

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
