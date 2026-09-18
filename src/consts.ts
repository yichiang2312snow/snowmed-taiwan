// 網站的基本設定 —— 要改網站名稱、標語、聯絡方式，改這個檔案就好
export const SITE = {
  /** 網站主標題 */
  name: '台灣滑雪運動醫學科學平台',
  nameEn: 'Taiwan Ski Sports Medicine Science Platform',
  /** 副標：第二行小字 */
  poweredBy: 'powered by 楊怡強醫師｜復健科專科醫師・疼痛醫學與運動醫學次專長・專攻滑雪運動醫學',
  /** 選單列用的短版副標 */
  poweredByShort: 'powered by 楊怡強醫師',
  doctor: '楊怡強 醫師',
  doctorEn: 'Dr. Yi-Chiang Yang',
  /** 醫師在其他平台的帳號（schema.org sameAs 用，幫搜尋引擎把同一個人連起來） */
  threads: 'https://www.threads.com/@snowdoc_ycy',
  author: '楊怡強 醫師',
  description:
    '免費、免註冊的滑雪運動醫學工具平台：行前體能自我檢測、訓練計畫產生器、雪場受傷分流判斷、何時該照 X 光、回歸雪場準備度評估、出發前檢核表、日本雪場選擇指引、台灣室內滑雪場館搜尋。每個工具都附上依據與適用範圍，你可以自己判斷要不要採用。',
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
  url: 'https://dr.snowmed-taiwan.com/',
  aboutUrl: 'https://dr.snowmed-taiwan.com/about/',
  articlesUrl: 'https://dr.snowmed-taiwan.com/articles',
  label: '楊怡強醫師衛教專文',
  labelLong: '楊怡強醫師個人網站的衛教專文',
} as const;

export const NAV = [
  { href: '/tools', label: '實用小工具' },
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
    where: '工具卡片：行前肌力＆體能訓練計畫產生器',
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
  {
    file: 'tools/tool-taiwan-indoor-ski.jpg',
    where: '工具卡片：台灣室內滑雪場館搜尋',
    title: '2015-08-22 Indoor ski slope at the Little Ding-Dong Science Theme Park',
    author: '曾成訓',
    authorUrl: 'https://commons.wikimedia.org/wiki/File:2015-08-22_Indoor_ski_slope_at_the_Little_Ding-Dong_Science_Theme_Park.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:2015-08-22_Indoor_ski_slope_at_the_Little_Ding-Dong_Science_Theme_Park.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    modified: '已裁切與縮放尺寸以符合網頁需求',
  },
  {
    file: 'anatomy/knee-anterior.png',
    where: '何時該照 X 光：膝蓋解剖圖',
    title: 'Blausen 0596 KneeAnatomy Front',
    author: 'BruceBlaus / Blausen Medical',
    authorUrl: 'https://commons.wikimedia.org/wiki/User:BruceBlaus',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Blausen_0596_KneeAnatomy_Front.png',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    modified: '已裁切、縮放，並移除原圖的英文標示引線',
  },
  {
    file: 'anatomy/ankle-lateral.png',
    where: '何時該照 X 光：腳踝外側解剖圖',
    title: 'Ankle-lateral',
    author: 'Baedr-9439',
    authorUrl: 'https://commons.wikimedia.org/wiki/File:Ankle-lateral.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ankle-lateral.png',
    license: 'CC0 1.0（公有領域）',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    modified: '已縮放尺寸以符合網頁需求',
  },
  {
    file: 'anatomy/ankle-medial.png',
    where: '何時該照 X 光：腳踝內側解剖圖',
    title: 'Ankle-medial',
    author: 'Baedr-9439',
    authorUrl: 'https://commons.wikimedia.org/wiki/File:Ankle-medial.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ankle-medial.png',
    license: 'CC0 1.0（公有領域）',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    modified: '已縮放尺寸以符合網頁需求',
  },
] as const;

/** 工具分類。沒受傷的人不用進到第二類。 */
export const TOOL_CATEGORIES = [
  {
    id: 'prep',
    label: '行前準備與訓練',
    short: '行前準備',
    emoji: '🎿',
    intro: '還沒出發、或還沒受傷的人看這一區。選雪場、練體能、打包。',
  },
  {
    id: 'injury',
    label: '受傷了才需要看',
    short: '受傷處理',
    emoji: '🚑',
    intro: '已經受傷、或同行者受傷時才用得到。沒事的話可以先跳過。',
  },
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]['id'];

/**
 * 平台上的工具。
 * 新增工具只要在這裡加一筆（記得填 category），首頁、工具箱和選單都會自動出現。
 * 陣列順序就是顯示順序，依「使用時機」排。
 */
/**
 * 工具的版本制度
 *
 * 每個工具有永久編號（SMT-T-xx，不會改）與版本號（年份.序號）。
 * 內容有實質更動時把 updated 改成當天、version 進一號；
 * 頁面上會顯示並提供引用格式，抄襲時一比對編號與版本就知道來源與新舊。
 */
export const TOOLS_VERSION = 'v2026.2';

export const TOOLS = [
  // ── 第一類：行前準備與訓練 ──────────────────────────
  {
    href: '/tools/japan-resorts',
    id: 'SMT-T-01',
    version: TOOLS_VERSION,
    updated: '2026-09-15',
    category: 'prep',
    name: '日本雪場選擇指引',
    emoji: '🗾',
    time: '約 2 分鐘',
    summary:
      '從醫師的角度挑雪場：交通與受傷後送、巡邏隊與最近的醫院、能不能帶小孩、有沒有公園設施（跳台、rail）。10 座雪場全數以官方資料查證，另附全日本 482 座雪場索引。',
    who: '還在決定要去哪個雪場，而且在意「萬一受傷怎麼辦」的人',
  },
  {
    href: '/tools/fitness-check',
    id: 'SMT-T-02',
    version: TOOLS_VERSION,
    updated: '2026-09-15',
    category: 'prep',
    name: '行前體能自我檢測',
    emoji: '🦵',
    time: '約 5 分鐘',
    summary: '五個在家就能做的動作測試，算出你目前的滑雪體能分數，並指出最需要補強的那一項。',
    who: '準備出發、想知道自己練夠了沒有的人',
  },
  {
    href: '/tools/training-plan',
    id: 'SMT-T-03',
    version: TOOLS_VERSION,
    updated: '2026-09-15',
    category: 'prep',
    name: '行前肌力＆體能訓練計畫產生器',
    emoji: '📅',
    time: '約 1 分鐘',
    summary: '輸入出發日期，自動排出到出發前的分期訓練行程，可以直接列印或存下來。',
    who: '已經決定行程、想知道每週該練什麼的人',
  },
  {
    href: '/tools/pre-trip-checklist',
    id: 'SMT-T-04',
    version: TOOLS_VERSION,
    updated: '2026-09-13',
    category: 'prep',
    name: '出發前注意事項互動檢核表',
    emoji: '✅',
    time: '約 3 分鐘',
    summary:
      '分成「在台灣出發前」「抵達雪場、滑行前」「滑行期間」三階段，依你的板種、程度與舊傷產生專屬清單，可列印或存成 PDF。',
    who: '所有要出發的人，尤其第一次去的',
  },

  {
    href: '/tools/taiwan-indoor-ski',
    id: 'SMT-T-09',
    version: TOOLS_VERSION,
    updated: '2026-09-15',
    category: 'prep',
    name: '台灣室內滑雪場館搜尋',
    emoji: '📍',
    time: '約 1 分鐘',
    summary:
      '出發前想先練？台灣有在營業的室內滑雪訓練場館地圖：含真雪的小叮噹滑雪場與各縣市的滑雪機場館，並標出全台少數有跳台與花式訓練設施的地方。',
    who: '想在出發前找回感覺、或第一次滑雪想先上幾堂課的人',
  },

  {
    href: '/tools/helmet-check',
    id: 'SMT-T-10',
    version: TOOLS_VERSION,
    updated: '2026-09-17',
    category: 'prep',
    name: '安全帽觀念快篩',
    emoji: '⛑️',
    time: '約 3 分鐘',
    summary:
      '有 MIPS 就比較安全嗎？大品牌一定好嗎？七題是非題測你挑安全帽的觀念，解說全部依據維吉尼亞理工 48 頂滑雪安全帽的實測資料，最後帶你到官方評等網站查型號。',
    who: '正要買安全帽，或想知道手上這頂該不該換的人',
  },
  // ── 第二類：受傷了才需要看 ──────────────────────────
  {
    href: '/tools/injury-triage',
    id: 'SMT-T-05',
    version: TOOLS_VERSION,
    updated: '2026-09-17',
    category: 'injury',
    name: '雪場受傷分流判斷',
    emoji: '🚨',
    time: '約 2 分鐘',
    summary: '在雪場受傷了，該叫巡邏隊、該當地就醫、還是可以自己觀察？在人形圖上找到受傷的部位、勾選症狀，依紅旗症狀判斷。',
    who: '人還在雪場、或剛受傷不知道該不該就醫的人',
  },
  {
    href: '/tools/xray-check',
    id: 'SMT-T-06',
    version: TOOLS_VERSION,
    updated: '2026-09-13',
    category: 'injury',
    name: '何時該照 X 光',
    emoji: '🩻',
    time: '約 3 分鐘',
    summary:
      '膝蓋或腳踝受傷了，到底需不需要照 X 光？用國際通用的「渥太華規則」逐項檢查，判斷是否需要影像檢查來排除骨折。',
    who: '膝蓋或腳踝剛受傷、不確定要不要去照影像的人',
  },
  {
    href: '/tools/concussion',
    id: 'SMT-T-07',
    version: TOOLS_VERSION,
    updated: '2026-09-13',
    category: 'injury',
    name: '腦震盪：看不見的傷',
    emoji: '🧠',
    time: '約 5 分鐘',
    summary:
      '撞到頭之後該注意什麼？症狀、嚴重度分級、現場可以做的觀察，以及為什麼「短時間內再撞一次」是最危險的事。',
    who: '撞到頭、或同行者撞到頭的人',
  },
  {
    href: '/tools/return-to-snow',
    id: 'SMT-T-08',
    version: TOOLS_VERSION,
    updated: '2026-09-15',
    category: 'injury',
    name: '回歸雪場準備度自評',
    emoji: '↩️',
    time: '約 5 分鐘',
    summary:
      '受傷或手術後想再滑雪？用肌力對稱性、功能測試與心理準備度三個面向檢查你到哪一階段了。',
    who: '傷後復健中、想知道「什麼時候能再滑」的人',
  },
] as const;
