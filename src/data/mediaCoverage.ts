/**
 * 媒體報導
 *
 * 2026-10-14 北榮「滑雪運動醫學門診」發布後的一批報導。
 *
 * mentionsPlatform 是「這篇內文有沒有真的提到本平台」—— 每一篇都實際抓下來
 * 搜過全文（含 JSON 與屬性，不只是看得到的文字），不是憑標題判斷。
 * 頁面分成兩區：true 的放「提到本平台的報導」，false 的放「相關媒體報導」。
 * 所以這個旗標決定的是放在哪一區，不是顯示或隱藏。
 *
 * verified 記錄查核狀態：'yes' 已確認提到、'no' 已確認沒提到、
 * 'unknown' 無法自動確認（例如 Facebook 擋掉未登入的抓取）。
 */

export interface MediaItem {
  /** 媒體名稱 */
  outlet: string;
  title: string;
  url: string;
  /** YYYY-MM-DD */
  date: string;
  /** 內文是否提到「台灣滑雪運動醫學科學平台」 */
  mentionsPlatform: boolean;
  verified: 'yes' | 'no' | 'unknown';
  /** 提到平台的那一段，摘錄給讀者看 */
  quote?: string;
  /** 同一篇報導的其他轉載位置 */
  mirrors?: { label: string; url: string }[];
}

export const MEDIA_COVERAGE: MediaItem[] = [
  {
    outlet: '聯合新聞網',
    title: '滑雪摔傷別只吞止痛藥　膝蓋、腳踝壓痛應就醫…醫建平台在國外可救命',
    url: 'https://udn.com/news/story/7266/9815073',
    date: '2026-10-14',
    mentionsPlatform: true,
    verified: 'yes',
    quote:
      '民眾也可以上「台灣滑雪運動醫學科學平台」，了解滑雪的相關知識，有事前雪場選擇指引、行前體能自我檢測、出發前注意事項互動檢核表，且人在國外受傷也可以上平台找資訊，了解第一時間該如何處置。',
    mirrors: [{ label: 'LINE TODAY 轉載', url: 'https://today.line.me/tw/v3/article/DRjwJKW' }],
  },
  {
    outlet: '民視新聞網',
    title: '獨／海外滑雪風氣日盛　北榮首創「滑雪運動醫學門診」為雪友照護把關',
    url: 'https://www.ftvnews.com.tw/news/detail/2026A14L13M1',
    date: '2026-10-14',
    mentionsPlatform: true,
    verified: 'yes',
    quote:
      '從受傷診斷、治療、復健一路把關，楊醫師也自發性設計滑雪運動醫學科學平台，讓愛滑雪的雪友們或是無經驗的新手，都能精準找到適合自己的場地、提供注意事項、受傷後如何尋求協助等資訊。',
    mirrors: [{ label: '民視新聞 YouTube', url: 'https://www.youtube.com/shorts/pNiVm9hZ_IQ' }],
  },

  {
    outlet: '臺北榮總 官方 Facebook',
    title: '滑雪受傷不痛了，就能重返雪場？臺北榮總開設滑雪運動醫學門診　整合診療與復健把關回場安全',
    url: 'https://www.facebook.com/share/p/1925GdjfAj/',
    date: '2026-10-14',
    // Facebook 擋掉未登入的抓取（HTTP 400），這一筆是楊醫師本人確認有提到平台，
    // 不是像其他幾筆那樣由程式抓全文比對出來的。
    mentionsPlatform: true,
    verified: 'yes',
  },

  // ── 以下報導的內文沒有提到本平台，依醫師指定的條件預設不顯示 ──
  {
    outlet: '聯合新聞網',
    title: '2年傷者增3倍　北榮滑雪門診統計：膝蓋最常受傷　雙板傷者比單板多',
    url: 'https://udn.com/news/story/7266/9814630',
    date: '2026-10-14',
    mentionsPlatform: false,
    verified: 'no',
  },
  {
    outlet: 'ETtoday 健康雲',
    title: '滑雪膝傷不痛別急著復出　北榮首創門診揪潛伏風險',
    url: 'https://health.ettoday.net/news/3254639',
    date: '2026-10-14',
    mentionsPlatform: false,
    verified: 'no',
  },
  {
    outlet: '中央社',
    title: '北榮首創滑雪運動門診　逾600人次就醫、膝蓋受傷多',
    url: 'https://www.cna.com.tw/news/ahel/202610140298.aspx',
    date: '2026-10-14',
    mentionsPlatform: false,
    verified: 'no',
    mirrors: [
      {
        label: 'PChome 新聞轉載',
        url: 'https://news.pchome.com.tw/living/cna/20261014/index-17919750520393418009.html',
      },
    ],
  },
  {
    outlet: 'PChome 新聞',
    title: '北榮首創　滑雪運動醫學門診　提供滑雪者完整醫療',
    url: 'https://news.pchome.com.tw/living/idn/20261015/index-79200663048463224009.html',
    date: '2026-10-15',
    mentionsPlatform: false,
    verified: 'no',
  },
  {
    outlet: '太報',
    title: '因應海外滑雪風氣日盛！北榮首創「滑雪運動醫學門診」　為雪友照護把關',
    url: 'https://today.line.me/tw/v3/article/7NGwYvl',
    date: '2026-10-14',
    mentionsPlatform: false,
    verified: 'no',
  },
  {
    outlet: '民報',
    title: '滑雪傷患暴增！北榮「滑雪門診」單月80人次　「膝蓋」成最常見傷處',
    url: 'https://www.peoplenews.tw/articles/healthcare/61412',
    date: '2026-10-14',
    mentionsPlatform: false,
    verified: 'no',
  },
];

/** 第一區：內文確實提到本平台的報導 */
export const PLATFORM_COVERAGE = MEDIA_COVERAGE.filter((m) => m.mentionsPlatform);

/** 第二區：同一批採訪裡沒有提到平台、但同樣是這個主題的報導 */
export const OTHER_COVERAGE = MEDIA_COVERAGE.filter((m) => !m.mentionsPlatform);
