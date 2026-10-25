/**
 * 新留言的 email 通知
 *
 * ── 為什麼是 HTTP API 而不是 SMTP ──────────────────────────
 * Cloudflare Workers 不能開 TCP 連線，寄信只能打別人的 HTTP API。
 * MailChannels 從 2024 年年中起不再對 Workers 免費，Cloudflare 自家的
 * send_email binding 又只支援 Workers、不支援 Pages Functions，
 * 所以這裡用 Resend 的 HTTP API。
 *
 * ── 失敗了會怎樣 ──────────────────────────────────────────
 * 什麼都不會怎樣。通知是附加功能：沒設定金鑰就直接跳過，寄不出去也只是
 * 安靜地結束。留言本身早就寫進 KV 了，絕對不能因為寄信失敗而讓網友的
 * 留言送不出去。
 *
 * ── 隱私 ──────────────────────────────────────────────────
 * 信裡只放留言內容本身（分類、暱稱、內文、時間）。不放 IP、不放雜湊值，
 * 收件人地址也只存在 Cloudflare 的 Secret 裡，不寫在程式碼裡。
 */

const ENDPOINT = 'https://api.resend.com/emails';
const ADMIN_URL = 'https://dr.snowmed-taiwan.com/admin/snowmed#wishes';

/** 三個設定值都有才會寄信 */
export function notifyConfigured(env) {
  return Boolean(env?.RESEND_API_KEY && env?.NOTIFY_EMAIL && env?.NOTIFY_FROM);
}

function taipei(iso) {
  try {
    return new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
  } catch {
    return iso;
  }
}

export async function sendWishNotification(env, wish) {
  if (!notifyConfigured(env)) return;

  const where = wish.from === 'home' ? '首頁留言框' : '許願區';
  // 標題帶一段內文，手機通知列掃一眼就知道是什麼事，不用每次都點開
  const peek = wish.text.replace(/\s+/g, ' ').slice(0, 24);

  const body = [
    `有人在${where}留言了。`,
    '',
    `分類：${wish.category}`,
    `暱稱：${wish.nickname}`,
    wish.resort ? `雪場：${wish.resort}` : null,
    `時間：${taipei(wish.createdAt)}`,
    '',
    '內容：',
    wish.text,
    '',
    '──────────',
    '這則留言現在是「待審」狀態，不會出現在前台。',
    `去審核與回覆：${ADMIN_URL}`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.NOTIFY_FROM,
        to: [env.NOTIFY_EMAIL],
        subject: `[滑雪平台] ${where}有新留言：${peek}…`,
        text: body,
      }),
    });

    if (!res.ok) {
      // 留一行線索在 Cloudflare 的即時日誌裡，但不要把金鑰或信箱印出來
      console.log('wish notify failed', res.status);
    }
  } catch (e) {
    console.log('wish notify error', e?.message ?? 'unknown');
  }
}
