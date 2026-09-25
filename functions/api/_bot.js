/**
 * 爬蟲判斷（只看 User-Agent）
 *
 * 這個站的統計是瀏覽器端用 JS 送出的，所以不執行 JS 的爬蟲本來就不會被算到。
 * 但會執行 JS 的爬蟲（Googlebot、GPTBot 這類會渲染頁面的）還是會送出統計，
 * 而且每一次都是全新的瀏覽器狀態 —— 造訪人數與頁面瀏覽都會被灌水。
 * 所以在伺服器端再擋一層：爬蟲送來的統計直接丟掉，回應仍然是 200，
 * 免得有人靠回應碼判斷自己被擋掉。
 *
 * 檔名開頭的底線讓 Cloudflare Pages 不把它當成 API 路由。
 *
 * 判斷邏輯與個人網站的 src/lib/is-bot.ts 相同，兩邊要改請一起改。
 */

const BOT_PATTERN =
  /bot\b|bot\/|spider|crawl|slurp|archiver|preview|fetcher|monitor|uptime|pingdom|gtmetrix|lighthouse|headless|phantom|puppeteer|playwright|selenium|scrapy|python-requests|python-urllib|curl\/|wget\/|node-fetch|axios\/|go-http-client|okhttp|java\/|libwww|httpclient|postman|insomnia|feedly|rss|facebookexternalhit|meta-external|whatsapp|telegram|line-poker|slackbot|discordbot|embedly|quora link|vercel|semrush|ahrefs|mj12|dotbot|blexbot|petalbot|dataforseo|serpstat|screaming frog|siteaudit|chatgpt-user|gptbot|claudebot|perplexitybot|oai-searchbot|amazonbot|applebot|bytespider|yandex|sogou|baiduspider/i;

/** Googlebot 行動版固定用的兩組舊裝置 UA，字面上看不出是爬蟲 */
const GOOGLE_MOBILE =
  /Nexus 5X Build\/MMB29P|iPhone; CPU iPhone OS 13_2_3 like Mac OS X.*Version\/13\.0\.3/i;

/** @param {Request} request */
export function isBotRequest(request) {
  const ua = request.headers.get('user-agent');
  if (!ua || !ua.trim()) return true; // 沒有 UA 的請求一律不計入
  return BOT_PATTERN.test(ua) || GOOGLE_MOBILE.test(ua);
}
