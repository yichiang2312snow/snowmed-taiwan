/**
 * 造訪人數計數器
 *
 * GET  /api/visits   讀目前的人數
 * POST /api/visits   人數 +1（由前端判斷是不是第一次來，只有第一次才會 POST）
 *
 * 資料存在 Cloudflare KV，不需要註冊第三方分析服務，也不收集任何個人資料 ——
 * 只有一個數字，不記錄 IP、不放 cookie、不做任何追蹤。
 */

const KEY = 'visits:total';

function json(data, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
    },
  });
}

export async function onRequestGet({ env }) {
  if (!env.VIEWS) return json({ count: null });
  const raw = await env.VIEWS.get(KEY);
  return json({ count: Number.parseInt(raw ?? '0', 10) || 0 }, 200, 'public, max-age=60');
}

export async function onRequestPost({ env }) {
  if (!env.VIEWS) return json({ count: null });
  const raw = await env.VIEWS.get(KEY);
  const next = (Number.parseInt(raw ?? '0', 10) || 0) + 1;
  await env.VIEWS.put(KEY, String(next));
  return json({ count: next });
}
