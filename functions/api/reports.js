/**
 * 雪場即時狀況回饋單 API
 *
 * GET  /api/reports   取回最近的回報（公開，給前台排成小卡片）
 * POST /api/reports   送出一則回報（即時公開，不經審核）
 *
 * 為什麼不像許願區那樣先審核：這個板子的價值就在「即時」——
 * 今天哪裡發生雪崩、哪個跳台結冰，等我審完隔天才出現就沒有意義了。
 * 換來的代價是要擋灌水，所以有蜜罐欄位、每小時上限與字數限制，
 * 另外留了 /api/reports/admin 可以隨時刪掉不實或不當的內容。
 *
 * 照片：有附照片的回報，文字照樣立刻公開，但照片要等站長在後台按核准才會出現
 * （/admin/reports）。理由是文字有時效、要快，照片則是最容易出事的地方
 * （認得出當事人、血腥畫面、廣告），值得先看過。
 *
 * ── KV 用量 ────────────────────────────────────────────────
 * 免費方案的 KV 每天只能 list() 1,000 次（popular.js 的註解有記取教訓），
 * 所以前台讀的是一份算好的清單 rpt:feed，完全不用 list()：
 *   讀 = 1 次 get()，寫 = 1 次 get() + 2 次 put()。
 * 每一筆同時另存一份 rpt:i:<時間>:<id>，萬一 feed 因為同時寫入掉了一筆，
 * 後台還找得回來。
 *
 * 一律不收集 email、不記錄 IP 原文（只存雜湊值做防灌水用）。
 */

const ITEM_PREFIX = 'rpt:i:';
const FEED_KEY = 'rpt:feed';
const RATE_PREFIX = 'rpt:rate:';
/** 待審照片的佇列（後台讀這個，不用 list()） */
const PENDING_KEY = 'rpt:pending';
/** 照片本體：rptimg:<回報 id> */
const IMAGE_PREFIX = 'rptimg:';

const LIMITS = {
  resort: 40,
  nickname: 20,
  text: 500,
  /** 前台清單最多留幾則 */
  feed: 80,
  /** 同一來源每小時最多送幾則 */
  perHour: 5,
  /** 單筆備份保留幾天 */
  keepDays: 180,
  /** 發生時間最多可以往前填幾天 */
  pastDays: 90,
  /** 發生時間最多可以比伺服器時間快幾小時（各雪場時區不同，留一點餘裕） */
  futureHours: 30,
  /** 照片大小上限（位元組，解碼後）。前端會先縮圖，這裡只是最後一道防線 */
  photoBytes: 2 * 1024 * 1024,
  /** 待審佇列最多留幾筆 */
  pending: 200,
};

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * 把前端送來的 data URL 轉成位元組。
 * 只收 JPEG／PNG／WebP，其他一律拒絕 —— 不要讓人把任何東西塞進 KV。
 */
function decodePhoto(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
  if (!m) return { error: '照片格式不支援，請用 JPG、PNG 或 WebP' };
  const type = m[1];
  if (!PHOTO_TYPES.includes(type)) return { error: '照片格式不支援' };

  let binary;
  try {
    binary = atob(m[2]);
  } catch {
    return { error: '照片讀不出來，請換一張試試' };
  }
  if (binary.length > LIMITS.photoBytes) return { error: '照片太大了，請換一張或縮小一點' };

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { type, bytes };
}

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

async function readJsonArray(env, key) {
  const raw = await env.VIEWS.get(key);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const readFeed = (env) => readJsonArray(env, FEED_KEY);

/**
 * 發生時間收的是 <input type="datetime-local"> 的字串（YYYY-MM-DDTHH:mm），
 * 也就是填表人眼前的「當地時間」。刻意不換算時區 ——
 * 雪場在日本、填表人可能人在台灣，換算只會讓兩邊都看到不是自己想的那個時間。
 * 前台顯示時會標明這是雪場當地時間。
 */
function validOccurredAt(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const t = Date.parse(`${value}:00Z`);
  if (Number.isNaN(t)) return false;

  const now = Date.now();
  if (t > now + LIMITS.futureHours * 3600 * 1000) return false;
  if (t < now - LIMITS.pastDays * 24 * 3600 * 1000) return false;
  return true;
}

export async function onRequestGet({ env }) {
  if (!env.VIEWS) return json({ reports: [] });

  try {
    const feed = await readFeed(env);
    return json({ reports: feed, total: feed.length }, 200, 'public, max-age=30');
  } catch {
    return json({ reports: [] });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.VIEWS) return json({ error: '儲存空間暫時無法使用，請稍後再試' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '格式錯誤' }, 400);
  }

  // 蜜罐欄位：真人看不到也不會填，填了就是機器人。回 ok 讓它以為成功了。
  if (body.website) return json({ ok: true, report: null });

  const resort = String(body.resort ?? '').trim().slice(0, LIMITS.resort);
  const occurredAt = String(body.occurredAt ?? '').trim();
  const nickname = String(body.nickname ?? '').trim().slice(0, LIMITS.nickname);
  const text = String(body.text ?? '').trim();

  if (!resort) return json({ error: '請填雪場名稱' }, 400);
  if (!validOccurredAt(occurredAt)) return json({ error: '發生時間不正確，請填最近 90 天內的時間' }, 400);
  if (text.length < 4) return json({ error: '事件內容太短了，多寫一點才幫得上其他人' }, 400);
  if (text.length > LIMITS.text) return json({ error: `事件內容請控制在 ${LIMITS.text} 字以內` }, 400);

  // 防灌水：同一來源每小時上限
  const src = await sourceKey(request);
  const rateKey = `${RATE_PREFIX}${src}`;
  const count = Number.parseInt((await env.VIEWS.get(rateKey)) ?? '0', 10) || 0;
  if (count >= LIMITS.perHour) {
    return json({ error: '你剛剛已經回報幾則了，請過一小時再試' }, 429);
  }

  // 照片是選填的。有附照片的話先存起來、標成待審，核准後才會公開出現。
  let photo = null;
  if (body.photo) {
    const decoded = decodePhoto(body.photo);
    if (decoded.error) return json({ error: decoded.error }, 400);
    photo = decoded;
  }

  const createdAt = new Date().toISOString();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const report = {
    id,
    resort,
    occurredAt,
    nickname: nickname || '匿名雪友',
    text,
    createdAt,
    photo: photo ? 'pending' : null,
  };

  const feed = await readFeed(env);
  feed.unshift(report);
  feed.sort((a, b) => (String(a.occurredAt) < String(b.occurredAt) ? 1 : -1));

  const writes = [
    env.VIEWS.put(FEED_KEY, JSON.stringify(feed.slice(0, LIMITS.feed))),
    env.VIEWS.put(`${ITEM_PREFIX}${createdAt}:${id}`, JSON.stringify({ ...report, src }), {
      expirationTtl: LIMITS.keepDays * 24 * 3600,
    }),
    env.VIEWS.put(rateKey, String(count + 1), { expirationTtl: 3600 }),
  ];

  if (photo) {
    const pending = await readJsonArray(env, PENDING_KEY);
    pending.unshift({ ...report, photoType: photo.type });
    writes.push(
      env.VIEWS.put(`${IMAGE_PREFIX}${id}`, photo.bytes, {
        expirationTtl: LIMITS.keepDays * 24 * 3600,
        metadata: { type: photo.type },
      }),
      env.VIEWS.put(PENDING_KEY, JSON.stringify(pending.slice(0, LIMITS.pending)))
    );
  }

  await Promise.all(writes);

  return json({ ok: true, report });
}
