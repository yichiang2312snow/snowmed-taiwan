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
    '免費、免註冊的滑雪運動醫學工具平台：行前體能自我檢測、訓練計畫產生器、雪場受傷分流判斷、何時該照 X 光、回歸雪場準備度評估、出發前檢核表、日本雪場選擇指引。每個工具都附上依據與適用範圍，你可以自己判斷要不要採用。',
  // TODO 待楊醫師確認：以下聯絡資訊目前是預留欄位
  email: '',
  clinicName: '',
  clinicAddress: '',
  lineId: '',
  instagram: '',
  facebook: '',
} as const;

/** 網站 A：楊醫師個人官網 */
export const SITE_A = {
  url: 'https://dr-yang-yi-chiang-website.vercel.app/',
  articlesUrl: 'https://dr-yang-yi-chiang-website.vercel.app/articles',
  label: '楊怡強醫師衛教專文',
  labelLong: '楊怡強醫師個人網站的衛教專文',
} as const;

export const NAV = [
  { href: '/tools', label: '工具' },
  { href: '/emergency', label: '海外受傷' },
  // 衛教文章都在楊醫師的個人網站上，這裡直接外連過去
  { href: SITE_A.articlesUrl, label: '知識庫', external: true },
  { href: '/wishlist', label: '許願區' },
  { href: '/about', label: '關於' },
] as const;

/**
 * 圖片出處標示（CC 授權要求標明作者與來源）
 * footer 會自動把全部列出來。
 */
export const IMAGE_CREDITS = [
  {
    file: 'hero-ski-slope.jpg',
    where: '首頁 HERO 區',
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
    file: 'tools/tool-fitness-check.jpg',
    where: '工具卡片：行前體能自我檢測',
    title: 'Fitness enthusiast performs a single-leg squat exercise in an indoor gym setting',
    author: 'Shixart1985',
    authorUrl: 'https://commons.wikimedia.org/w/index.php?curid=186911197',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=186911197',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'tools/tool-training-plan.jpg',
    where: '工具卡片：行前訓練計畫產生器',
    title: 'Fitness Model Leg Exercise Strength Weight Training',
    author: 'ThoroughlyReviewed',
    authorUrl: 'https://www.flickr.com/photos/143842337@N03/',
    sourceUrl: 'https://www.flickr.com/photos/143842337@N03/32004788223',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'tools/tool-injury-triage.jpg',
    where: '工具卡片：雪場受傷分流判斷',
    title: 'Gebirgstrage02 Patient Seilsicherung',
    author: 'René Kieselmann (rmk)',
    authorUrl: 'https://commons.wikimedia.org/w/index.php?curid=778254',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=778254',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    modified: '已裁切與縮放尺寸；修改後的版本同樣以 CC BY-SA 2.0 授權',
  },
  {
    file: 'tools/tool-return-to-snow.jpg',
    where: '工具卡片：回歸雪場準備度自評',
    title: 'THE WONDERFUL HILLS OF BANSKO',
    author: 'summonedbyfells',
    authorUrl: 'https://www.flickr.com/photos/8521690@N02/',
    sourceUrl: 'https://www.flickr.com/photos/8521690@N02/12908807375',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'tools/tool-pre-trip-checklist.jpg',
    where: '工具卡片：出發前注意事項互動檢核表',
    title: 'Cross-country equipment — Skate and Classic',
    author: 'HopsonRoad',
    authorUrl: 'https://commons.wikimedia.org/w/index.php?curid=36823002',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=36823002',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    modified: '已裁切與縮放尺寸；修改後的版本同樣以 CC BY-SA 4.0 授權',
  },
  {
    file: 'tools/tool-concussion.jpg',
    where: '工具卡片：腦震盪說明',
    title: 'Skier wearing goggles and blue jacket',
    author: 'Félix An',
    authorUrl: 'https://commons.wikimedia.org/w/index.php?curid=147037565',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=147037565',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'tools/tool-japan-resorts.jpg',
    where: '工具卡片：日本雪場選擇指引',
    title: 'Winter in Hokkaido (Furano Ski Resort)',
    author: 'LIONEL-ARTS',
    authorUrl: 'https://www.flickr.com/photos/64408374@N05/',
    sourceUrl: 'https://www.flickr.com/photos/64408374@N05/26130354680',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    modified: '已裁切與縮放尺寸；修改後的版本同樣以 CC BY-SA 2.0 授權',
  },
  {
    file: 'tools/tool-xray-check.jpg',
    where: '工具卡片：何時該照 X 光',
    title: 'Knee plain X-ray weight bearing',
    author: 'Ptrump16',
    authorUrl: 'https://commons.wikimedia.org/w/index.php?curid=114900544',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=114900544',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    modified: '已裁切與縮放尺寸；修改後的版本同樣以 CC BY-SA 4.0 授權',
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
  {
    href: '/tools/xray-check',
    name: '何時該照 X 光',
    emoji: '🩻',
    time: '約 3 分鐘',
    summary:
      '膝蓋或腳踝受傷了，到底需不需要照 X 光？用國際通用的「渥太華規則」逐項檢查，判斷是否需要影像檢查來排除骨折。',
    who: '膝蓋或腳踝剛受傷、不確定要不要去照影像的人',
  },
  {
    href: '/tools/concussion',
    name: '腦震盪：看不見的傷',
    emoji: '🧠',
    time: '約 5 分鐘',
    summary:
      '撞到頭之後該注意什麼？症狀、嚴重度分級、現場可以做的觀察，以及為什麼「短時間內再撞一次」是最危險的事。',
    who: '撞到頭、或同行者撞到頭的人',
  },
  {
    href: '/tools/japan-resorts',
    name: '日本雪場選擇指引',
    emoji: '🗾',
    time: '約 2 分鐘',
    summary:
      '第一次去日本滑雪，該選哪個雪場？依照你的程度、天數與重視的條件，篩出適合的區域，並附上當地醫療資訊。',
    who: '還在決定要去哪個雪場的人',
  },
] as const;
