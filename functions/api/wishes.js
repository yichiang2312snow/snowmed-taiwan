/**
 * 許願留言區 API
 *
 * GET  /api/wishes   取回已通過審核的許願（公開）
 * POST /api/wishes   送出一則許願（一律進入待審，不會直接公開）
 *
 * 資料存在 Cloudflare KV，不需要註冊第三方服務，也不需要 API 金鑰。
 * 刻意不收集 email、不記錄 IP 原文（只存雜湊後的值做防灌水用）。
 */

const PREFIX = 'wish:';
const RATE_PREFIX = 'rate:';

const LIMITS = {
  text: 500,
  nickname: 20,
  resort: 40,
  /** 同一來源每小時最多送幾則 */
  perHour: 5,
};

const CATEGORIES = ['工具許願', '雪場資訊', '傷害問題', '裝備', '其他'];

function json(data, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
    },
  });
}

/** 只留雜湊，不存 IP 原文 */
async function sourceKey(request) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(buf)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestGet({ env }) {
  if (!env.VIEWS) return json({ wishes: [], total: 0 });

  try {
    const out = [];
    let total = 0;
    let cursor;

    do {
      const list = await env.VIEWS.list({ prefix: PREFIX, cursor });
      for (const key of list.keys) {
        const raw = await env.VIEWS.get(key.name);
        if (!raw) continue;
        let wish;
        try {
          wish = JSON.parse(raw);
        } catch {
          continue;
        }
        total += 1;
        if (wish.status === 'approved') {
          out.push({
            id: wish.id,
            category: wish.category,
            resort: wish.resort,
            text: wish.text,
            nickname: wish.nickname,
            createdAt: wish.createdAt,
            reply: wish.reply ?? null,
          });
        }
      }
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);

    out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return json({ wishes: out, total }, 200, 'public, max-age=60');
  } catch {
    return json({ wishes: [], total: 0 });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.VIEWS) return json({ error: 'storage unavailable' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '格式錯誤' }, 400);
  }

  // 蜜罐欄位：真人看不到也不會填，填了就是機器人
  if (body.website) return json({ ok: true, queued: true });

  const text = String(body.text ?? '').trim();
  const category = String(body.category ?? '').trim();
  const nickname = String(body.nickname ?? '').trim().slice(0, LIMITS.nickname);
  const resort = String(body.resort ?? '').trim().slice(0, LIMITS.resort);

  if (text.length < 4) return json({ error: '內容太短了，多寫一點吧' }, 400);
  if (text.length > LIMITS.text) return json({ error: `內容請控制在 ${LIMITS.text} 字以內` }, 400);
  if (!CATEGORIES.includes(category)) return json({ error: '分類不正確' }, 400);

  // 防灌水：同一來源每小時上限
  const src = await sourceKey(request);
  const rateKey = `${RATE_PREFIX}${src}`;
  const count = Number.parseInt((await env.VIEWS.get(rateKey)) ?? '0', 10) || 0;
  if (count >= LIMITS.perHour) {
    return json({ error: '你剛剛已經送出幾則了，請過一小時再試' }, 429);
  }
  await env.VIEWS.put(rateKey, String(count + 1), { expirationTtl: 3600 });

  const now = new Date().toISOString();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const wish = {
    id,
    category,
    resort: resort || null,
    text,
    nickname: nickname || '匿名雪友',
    status: 'pending',
    createdAt: now,
    reviewedAt: null,
    reply: null,
    src,
  };

  await env.VIEWS.put(`${PREFIX}${now}:${id}`, JSON.stringify(wish));

  return json({ ok: true, queued: true });
}
