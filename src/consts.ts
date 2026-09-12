// 網站的基本設定 —— 要改網站名稱、標語、聯絡方式，改這個檔案就好
export const SITE = {
  name: 'SnowMed Taiwan',
  doctor: '楊怡強 醫師',
  doctorEn: 'Dr. Yi-Chiang Yang',
  author: '楊怡強 醫師',
  tagline: '台灣第一位專攻滑雪運動醫學的醫師',
  description:
    '楊怡強醫師 — 台灣第一位專攻滑雪運動醫學的醫師。滑雪行前體能準備、雪地運動傷害、以及受傷後回歸雪場的完整衛教部落格。',
  // TODO 待楊醫師確認：以下聯絡資訊目前是預留欄位
  email: '',
  clinicName: '',
  clinicAddress: '',
  lineId: '',
  instagram: '',
  facebook: '',
} as const;

export const NAV = [
  { href: '/', label: '文章' },
  { href: '/about', label: '關於我' },
  { href: '/ski-medicine', label: '滑雪運動醫學' },
  { href: '/injury-prevention', label: '傷害預防' },
  { href: '/clinic', label: '門診與諮詢' },
] as const;

/**
 * 圖片出處標示（CC BY 授權要求）
 * key 對應 src/assets/ 底下的檔名，footer 會自動把全部列出來。
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
