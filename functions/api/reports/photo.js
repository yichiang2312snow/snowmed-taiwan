/**
 * 雪場即時狀況回饋單的照片
 *
 * GET /api/reports/photo?id=<回報ID>
 *
 * 已核准的照片任何人都看得到；還在待審的只有帶著管理 token 的人看得到
 * （後台 /admin/reports 就是這樣預覽的）。
 * 「有沒有核准」以前台清單 rpt:feed 裡那一筆的 photo 欄位為準 ——
 * 只有一個地方記狀態，不會出現「清單說核准了、照片說還沒」的情況。
 */

const FEED_KEY = 'rpt:feed';
const IMAGE_PREFIX = 'rptimg:';

function text(body, status) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** 固定時間比較，避免用回應時間猜 token */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAdmin(request, env) {
  const expected = env.REPORT_ADMIN_TOKEN ?? env.WISH_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return safeEqual(token, expected.trim());
}

export async function onRequestGet({ request, env }) {
  if (!env.VIEWS) return text('storage unavailable', 503);

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^[a-z0-9]{6,40}$/.test(id)) return text('bad id', 400);

  let approved = false;
  try {
    const raw = await env.VIEWS.get(FEED_KEY);
    const feed = raw ? JSON.parse(raw) : [];
    const hit = Array.isArray(feed) ? feed.find((r) => r && r.id === id) : null;
    approved = hit?.photo === 'approved';
  } catch {
    approved = false;
  }

  if (!approved && !isAdmin(request, env)) return text('not found', 404);

  const { value, metadata } = await env.VIEWS.getWithMetadata(`${IMAGE_PREFIX}${id}`, {
    type: 'arrayBuffer',
  });
  if (!value) return text('not found', 404);

  return new Response(value, {
    headers: {
      'content-type': metadata?.type ?? 'image/jpeg',
      // 核准後的照片不會再變，讓瀏覽器與 CDN 放心快取；待審的每次都重抓
      'cache-control': approved ? 'public, max-age=604800, immutable' : 'no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
    },
  });
}
