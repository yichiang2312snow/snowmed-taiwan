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
 *
 * 每個選項的 recommend：投完票之後推薦給這個人的工具（href 對應 consts.ts 的 TOOLS）
 * 與一句「為什麼推薦你這個」。
 */
export const POLLS = [
  {
    id: 'board',
    emoji: '🏂',
    question: '單板還是雙板比較好玩？',
    options: [
      {
        id: 'ski',
        label: '雙板 Ski',
        recommend: { href: '/tools/pre-trip-checklist', why: '雙板最常傷的是膝蓋和拇指。檢核表會依雙板給你專屬的準備清單。' },
      },
      {
        id: 'snowboard',
        label: '單板 Snowboard',
        recommend: { href: '/tools/pre-trip-checklist', why: '單板最常傷的是手腕和肩膀。檢核表會依單板給你專屬的準備清單。' },
      },
      {
        id: 'both',
        label: '兩個都好玩',
        recommend: { href: '/tools/fitness-check', why: '兩種都玩的人，先花五分鐘測一下體能練夠了沒。' },
      },
    ],
  },
  {
    id: 'country',
    emoji: '🌏',
    question: '最想去哪裡滑雪？',
    options: [
      {
        id: 'japan',
        label: '日本',
        recommend: { href: '/tools/japan-resorts', why: '10 個日本雪場的難易度、帶小孩、中文服務、票價比較，附當地醫院。' },
      },
      {
        id: 'korea',
        label: '韓國',
        recommend: { href: '/tools/pre-trip-checklist', why: '不管去哪，出發前該帶什麼、保險要確認什麼都一樣。' },
      },
      {
        id: 'china',
        label: '中國',
        recommend: { href: '/tools/pre-trip-checklist', why: '不管去哪，出發前該帶什麼、保險要確認什麼都一樣。' },
      },
      {
        id: 'oceania',
        label: '澳洲・紐西蘭',
        recommend: { href: '/tools/pre-trip-checklist', why: '南半球雪季在七、八月。出發前該帶什麼、保險要確認什麼都一樣。' },
      },
      {
        id: 'northamerica',
        label: '北美（美國・加拿大）',
        recommend: { href: '/tools/pre-trip-checklist', why: '北美就醫費用非常高，保險那一段請務必勾完。' },
      },
      {
        id: 'europe',
        label: '歐洲',
        recommend: { href: '/tools/pre-trip-checklist', why: '歐洲雪場規模大、野雪區多，行前清單裡「滑行期間」那段要看。' },
      },
    ],
  },
  {
    id: 'fear',
    emoji: '🩹',
    question: '滑雪時最怕傷到哪裡？',
    options: [
      {
        id: 'knee',
        label: '膝蓋',
        recommend: { href: '/tools/xray-check', why: '膝蓋扭到後要不要照 X 光？用渥太華規則三分鐘自己檢查。' },
      },
      {
        id: 'wrist',
        label: '手腕',
        recommend: { href: '/tools/pre-trip-checklist', why: '手腕骨折是單板新手最常見的傷，護腕就在檢核表的第一區。' },
      },
      {
        id: 'head',
        label: '頭',
        recommend: { href: '/tools/concussion', why: '撞到頭之後該注意什麼、哪些症狀要立刻就醫，這一頁講清楚。' },
      },
      {
        id: 'shoulder',
        label: '肩膀',
        recommend: { href: '/tools/injury-triage', why: '肩膀受傷當下該叫巡邏隊還是自己觀察？兩分鐘分流判斷。' },
      },
      {
        id: 'tailbone',
        label: '屁股・尾椎',
        recommend: { href: '/tools/pre-trip-checklist', why: '護臀是單板新手最值得帶的東西之一，檢核表裡有。' },
      },
    ],
  },
  {
    id: 'train',
    emoji: '🏋️',
    question: '出發前有練體能嗎？',
    options: [
      {
        id: 'yes',
        label: '有，認真練',
        recommend: { href: '/tools/fitness-check', why: '練了就測一下：五個動作測試，看看哪一項最弱。' },
      },
      {
        id: 'some',
        label: '隨便動一動',
        recommend: { href: '/tools/training-plan', why: '輸入出發日期，自動排出到出發前每週該練什麼。' },
      },
      {
        id: 'no',
        label: '沒有，直接上',
        recommend: { href: '/tools/training-plan', why: '現在開始還來得及。輸入出發日期，自動排出到出發前的訓練行程。' },
      },
    ],
  },
];
