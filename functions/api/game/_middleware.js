/**
 * 遊戲 API 的跨站存取（CORS）
 *
 * 遊戲的畫面在個人網站 dr.snowmed-taiwan.com，資料與 AI 評分在這裡（Cloudflare）。
 * 組長與計分板的瀏覽器會直接打這裡的 API，所以要允許那個網域跨站呼叫；
 * 主持人的操作則由個人網站的伺服器端代為轉送（token 不會到瀏覽器），不需要 CORS。
 *
 * 本機開發：個人網站跑在 localhost:4321，也放行。
 * 要再加網域，設 Cloudflare 環境變數 GAME_CORS_ORIGINS（逗號分隔）。
 */

const DEFAULT_ORIGINS = [
  'https://dr.snowmed-taiwan.com',
  'https://www.dr.snowmed-taiwan.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];

function allowedOrigin(request, env) {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const extra = String(env.GAME_CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra].includes(origin) ? origin : null;
}

function withCors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', origin);
  headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  headers.set('access-control-allow-headers', 'content-type, authorization');
  headers.set('access-control-max-age', '600');
  headers.append('vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function onRequest({ request, env, next }) {
  const origin = allowedOrigin(request, env);
  if (request.method === 'OPTIONS') {
    return origin ? withCors(new Response(null, { status: 204 }), origin) : new Response(null, { status: 204 });
  }
  const response = await next();
  return origin ? withCors(response, origin) : response;
}
