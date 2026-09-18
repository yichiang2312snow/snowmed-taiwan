/**
 * 雪友投票
 *
 * GET  /api/polls                     讀全部題目的票數
 * POST /api/polls  { poll, option }   投一票，回傳這一題最新的票數
 *
 * 跟瀏覽計數一樣存在 Cloudflare KV，只有數字：
 * 不放 cookie、不記錄 IP（連雜湊都不存）、不產生訪客識別碼。
 * 「一人一票」由前端的 localStorage 負責 —— 這只是個小玩具，
 * 認真灌票的人擋不住，也不值得為了擋他去記錄任何人。
 */

import { POLLS, DATE_POLL_RANGE, dateBucket } from './_polls.js';

const PREFIX = 'poll:';

/**
 * 日期題（type: 'date'）的票數不是一個選項一個 key，
 * 而是整包存成一個 JSON：{ '2027-01-H1': 12, ... }。
 * 理由是候選的半月區間有幾十個，如果一個區間一個 key，
 * 每次讀 /api/polls 就要多打幾十次 KV —— 免費方案的額度禁不起這樣花。
 */
const bucketsKey = (id) => `${PREFIX}${id}:buckets`;

async function readBuckets(env, poll) {
  const raw = await env.VIEWS.get(bucketsKey(poll.id));
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

/** 日期要在合理範圍內，不然有人填 1900 年或 2099 年，圖表就毀了 */
function dateInRange(iso) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  if (t < now - DATE_POLL_RANGE.pastDays * 86400000) return false;
  if (t > now + DATE_POLL_RANGE.futureDays * 86400000) return false;
  return true;
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

async function readPoll(env, poll) {
  const counts = {};
  await Promise.all(
    poll.options.map(async (o) => {
      const raw = await env.VIEWS.get(`${PREFIX}${poll.id}:${o.id}`);
      counts[o.id] = Number.parseInt(raw ?? '0', 10) || 0;
    })
  );
  return counts;
}

export async function onRequestGet({ env }) {
  if (!env.VIEWS) return json({ polls: null }, 200);
  const polls = {};
  await Promise.all(
    POLLS.map(async (p) => {
      polls[p.id] = p.type === 'date' ? await readBuckets(env, p) : await readPoll(env, p);
    })
  );
  return json({ polls }, 200, 'public, max-age=30');
}

export async function onRequestPost({ request, env }) {
  if (!env.VIEWS) return json({ ok: false }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const poll = POLLS.find((p) => p.id === String(body.poll ?? ''));
  if (!poll) return json({ ok: false }, 400);

  // 日期題：把日期換算成半月區間，累加在同一包 JSON 裡
  if (poll.type === 'date') {
    const date = String(body.date ?? '');
    const bucket = dateBucket(date);
    if (!bucket || !dateInRange(date)) return json({ ok: false, error: '日期不在可以填的範圍內' }, 400);

    const counts = await readBuckets(env, poll);
    counts[bucket] = (Number(counts[bucket]) || 0) + 1;
    await env.VIEWS.put(bucketsKey(poll.id), JSON.stringify(counts));

    return json({ ok: true, poll: poll.id, bucket, counts });
  }

  const option = poll.options?.find((o) => o.id === String(body.option ?? ''));
  if (!option) return json({ ok: false }, 400);

  const key = `${PREFIX}${poll.id}:${option.id}`;
  const cur = Number.parseInt((await env.VIEWS.get(key)) ?? '0', 10) || 0;
  await env.VIEWS.put(key, String(cur + 1));

  const counts = await readPoll(env, poll);
  counts[option.id] = Math.max(counts[option.id], cur + 1);
  return json({ ok: true, poll: poll.id, counts });
}
