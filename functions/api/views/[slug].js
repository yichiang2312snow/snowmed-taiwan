/**
 * GET  /api/views/:slug  讀取瀏覽次數
 * POST /api/views/:slug  加一並回傳新的次數
 *
 * 資料存在 Cloudflare KV，不需要註冊第三方服務，也不需要 API 金鑰。
 */
const KEY = (slug) => `v:${slug}`;
const VALID = /^[a-z0-9][a-z0-9-]{0,119}$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequestGet({ params, env }) {
  const slug = String(params.slug ?? '');
  if (!VALID.test(slug)) return json({ error: 'invalid slug' }, 400);
  if (!env.VIEWS) return json({ slug, views: null });

  const raw = await env.VIEWS.get(KEY(slug));
  return json({ slug, views: Number.parseInt(raw ?? '0', 10) || 0 });
}

export async function onRequestPost({ params, env }) {
  const slug = String(params.slug ?? '');
  if (!VALID.test(slug)) return json({ error: 'invalid slug' }, 400);
  if (!env.VIEWS) return json({ slug, views: null });

  const raw = await env.VIEWS.get(KEY(slug));
  const next = (Number.parseInt(raw ?? '0', 10) || 0) + 1;
  await env.VIEWS.put(KEY(slug), String(next));
  return json({ slug, views: next });
}
