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

import { POLLS } from './_polls.js';

const PREFIX = 'poll:';

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
      polls[p.id] = await readPoll(env, p);
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
  const option = poll?.options.find((o) => o.id === String(body.option ?? ''));
  if (!poll || !option) return json({ ok: false }, 400);

  const key = `${PREFIX}${poll.id}:${option.id}`;
  const cur = Number.parseInt((await env.VIEWS.get(key)) ?? '0', 10) || 0;
  await env.VIEWS.put(key, String(cur + 1));

  const counts = await readPoll(env, poll);
  counts[option.id] = Math.max(counts[option.id], cur + 1);
  return json({ ok: true, poll: poll.id, counts });
}
