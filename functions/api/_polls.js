/**
 * 雪友投票的題目。
 *
 * 這個檔案同時給兩邊用：
 * - 首頁的 Polls.astro 拿它來畫題目
 * - /api/polls 拿它來驗證投票是不是合法的題目與選項
 * 所以題目只要改這裡，前後端就一起變。
 *
 * 檔名開頭的底線讓 Cloudflare Pages 不把它當成 API 路由。
 *
 * 加題目：加一個物件即可，id 用英數與連字號，改了 id 等於重新計票。
 * 刪題目：刪掉物件即可，舊票留在 KV 裡不會顯示。
 */
export const POLLS = [
  {
    id: 'board',
    emoji: '🏂',
    question: '單板還是雙板比較好玩？',
    options: [
      { id: 'ski', label: '雙板 Ski' },
      { id: 'snowboard', label: '單板 Snowboard' },
      { id: 'both', label: '兩個都好玩' },
    ],
  },
  {
    id: 'country',
    emoji: '🌏',
    question: '最想去哪裡滑雪？',
    options: [
      { id: 'japan', label: '日本' },
      { id: 'korea', label: '韓國' },
      { id: 'china', label: '中國' },
      { id: 'oceania', label: '澳洲・紐西蘭' },
      { id: 'northamerica', label: '北美（美國・加拿大）' },
      { id: 'europe', label: '歐洲' },
    ],
  },
  {
    id: 'fear',
    emoji: '🩹',
    question: '滑雪時最怕傷到哪裡？',
    options: [
      { id: 'knee', label: '膝蓋' },
      { id: 'wrist', label: '手腕' },
      { id: 'head', label: '頭' },
      { id: 'shoulder', label: '肩膀' },
      { id: 'tailbone', label: '屁股・尾椎' },
    ],
  },
  {
    id: 'train',
    emoji: '🏋️',
    question: '出發前有練體能嗎？',
    options: [
      { id: 'yes', label: '有，認真練' },
      { id: 'some', label: '隨便動一動' },
      { id: 'no', label: '沒有，直接上' },
    ],
  },
];
