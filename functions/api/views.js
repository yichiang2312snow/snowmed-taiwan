/**
 * GET /api/views
 * 一次回傳所有文章的瀏覽次數，給首頁卡片用。
 */
export async function onRequestGet({ env }) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=30',
      },
    });

  if (!env.VIEWS) return json({});

  try {
    const counts = {};
    let cursor;
    do {
      const list = await env.VIEWS.list({ prefix: 'v:', cursor });
      for (const key of list.keys) {
        const raw = await env.VIEWS.get(key.name);
        counts[key.name.slice(2)] = Number.parseInt(raw ?? '0', 10) || 0;
      }
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);
    return json(counts);
  } catch {
    return json({});
  }
}
