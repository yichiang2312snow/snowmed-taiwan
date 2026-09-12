// 網站的基本設定 —— 要改網站名稱、標語、聯絡方式，改這個檔案就好
export const SITE = {
  /** 網站主標題 */
  name: '台灣滑雪運動醫學科學平台',
  nameEn: 'Taiwan Ski Sports Medicine Science Platform',
  /** 副標：第二行小字 */
  poweredBy: 'powered by 楊怡強醫師－全台第一位滑雪運動醫學專科醫師',
  /** 選單列用的短版副標 */
  poweredByShort: 'powered by 楊怡強醫師',
  doctor: '楊怡強 醫師',
  doctorEn: 'Dr. Yi-Chiang Yang',
  author: '楊怡強 醫師',
  description:
    '免費、免註冊的滑雪運動醫學工具平台：行前體能自我檢測、訓練計畫產生器、雪場受傷分流判斷、回歸雪場準備度評估、裝備檢查清單。每個工具都附上依據與適用範圍，你可以自己判斷要不要採用。',
  // TODO 待楊醫師確認：以下聯絡資訊目前是預留欄位
  email: '',
  clinicName: '',
  clinicAddress: '',
  lineId: '',
  instagram: '',
  facebook: '',
} as const;

export const NAV = [
  { href: '/tools', label: '工具' },
  { href: '/articles', label: '知識庫' },
  { href: '/ski-medicine', label: '滑雪傷害圖鑑' },
  { href: '/injury-prevention', label: '傷害預防' },
  { href: '/about', label: '關於這個平台' },
] as const;

/**
 * 圖片出處標示（CC BY 授權要求）
 * footer 會自動把全部列出來。
 */
export const IMAGE_CREDITS = [
  {
    file: 'hero-ski-slope.jpg',
    where: '首頁 HERO 區、文章 HERO 區',
    title: 'Kyrgyzstan Alpinism and Downhill Skiing',
    author: 'Thomas Depenbusch (Depi)',
    authorUrl: 'https://www.flickr.com/photos/8324633@N03/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Kyrgyzstan_Alpinism_and_Downhill_Skiing_(7208590364).jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已縮放尺寸以符合網頁需求',
  },
  {
    file: 'article-downhill.jpg',
    where: '文章 HERO 區',
    title: 'Kyrgyzstan Downhill Skiing',
    author: 'Thomas Depenbusch (Depi)',
    authorUrl: 'https://www.flickr.com/photos/8324633@N03/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Kyrgyzstan_Downhill_Skiing_(7208585660).jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'article-bluemountains.jpg',
    where: '文章 HERO 區',
    title: 'Blue Mountains',
    author: 'Michael from Calgary',
    authorUrl: 'https://commons.wikimedia.org/wiki/File:Blue_Mountains_(7672976922).jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Blue_Mountains_(7672976922).jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'article-rugova.jpg',
    where: '文章 HERO 區',
    title: 'Rugova Mountains in Boge during winter season in Kosovo',
    author: 'SUHEJLO',
    authorUrl:
      'https://commons.wikimedia.org/wiki/File:Rugova_Mountains_in_Boge_during_winter_season_in_Kosovo.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rugova_Mountains_in_Boge_during_winter_season_in_Kosovo.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
] as const;

/** 平台上的工具。新增工具只要在這裡加一筆，首頁和 /tools 都會自動出現 */
export const TOOLS = [
  {
    href: '/tools/fitness-check',
    name: '行前體能自我檢測',
    emoji: '🦵',
    time: '約 5 分鐘',
    summary:
      '五個在家就能做的動作測試，算出你目前的滑雪體能分數，並指出最需要補強的那一項。',
    who: '準備出發、想知道自己練夠了沒有的人',
  },
  {
    href: '/tools/training-plan',
    name: '行前訓練計畫產生器',
    emoji: '📅',
    time: '約 1 分鐘',
    summary: '輸入出發日期，自動排出到出發前的分期訓練行程，可以直接列印或存下來。',
    who: '已經決定行程、想知道每週該練什麼的人',
  },
  {
    href: '/tools/injury-triage',
    name: '雪場受傷分流判斷',
    emoji: '🚨',
    time: '約 2 分鐘',
    summary:
      '在雪場受傷了，該叫巡邏隊、該當地就醫、還是可以自己觀察？依照紅旗症狀逐步判斷。',
    who: '人還在雪場、或剛受傷不知道該不該就醫的人',
  },
  {
    href: '/tools/return-to-snow',
    name: '回歸雪場準備度自評',
    emoji: '↩️',
    time: '約 5 分鐘',
    summary:
      '受傷或手術後想再滑雪？用肌力對稱性、功能測試與心理準備度三個面向檢查你到哪一階段了。',
    who: '傷後復健中、想知道「什麼時候能再滑」的人',
  },
  {
    href: '/tools/pre-trip-checklist',
    name: '出發前注意事項互動檢核表',
    emoji: '✅',
    time: '約 3 分鐘',
    summary:
      '選擇板種、程度和舊傷，產生專屬於你的行前清單。涵蓋防護裝備、雪具設定、身體準備、保險文件與雪場原則，可列印或存成 PDF。',
    who: '所有要出發的人，尤其第一次去的',
  },
] as const;
