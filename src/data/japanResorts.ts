import type { Resort, Level, Priority } from './japanResortTypes';

export type { Resort, Level, Priority, Gateway } from './japanResortTypes';

/**
 * 日本主要雪場區域資料
 *
 * ⚠️ 維護規則
 * 每個數字都必須附上 source（實際看到它的網址）與 checkedAt。
 * 查不到就填 null 並在 missingNote 說明 —— 寧可留白，不要自己推估。
 * 票價與難易度比率每季都會變，頁面上一律顯示查證日期並要使用者以官網為準。
 *
 * 資料來源層級：
 *   official  = 雪場官方網站
 *   secondary = SnowJapan、Powderhounds 等專業資料站
 */

export const PRIORITY_LABELS: Record<Priority, string> = {
  powder: '想滑好雪質、粉雪',
  language: '需要中文或英文服務',
  family: '帶小孩或長輩同行',
  onsen: '想順便泡溫泉',
  value: '想控制預算',
  short: '行程短，想省交通時間',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: '新手（還在練基本轉彎）',
  intermediate: '中階（能穩定滑紅線）',
  advanced: '進階（黑線、樹林、深雪）',
};

export const PRICE_TIER_LABELS = {
  low: '偏低',
  mid: '中等',
  'mid-high': '中等偏高',
  high: '偏高',
} as const;

export const SKI_IN_OUT_LABELS = {
  full: '有雪道直結住宿',
  partial: '雪場旁，但要走一段或搭接駁',
  none: '雪場本身沒有住宿',
} as const;

export const FAMILY_RATING_LABELS = {
  high: '很適合',
  medium: '尚可',
  low: '較不適合',
} as const;

/**
 * 規劃這個工具時掃過的來源：台灣人查日本雪場時最常遇到的中文內容站，
 * 加上兩個國際通用的雪場資料庫。
 *
 * ⚠️ 它們決定了「該比較哪些項目」，但沒有任何一個數字直接取用 ——
 * 卡片上的每個數字都回到雪場官網重新查證過。因為這類內容站多半不標查證日期，
 * 票價與雪季一變就過期，而本站的規矩是：查不到就留白，不轉述沒有出處的數字。
 */
export const REFERENCE_SITES = [
  { name: '娜塔蝦的滑雪食旅手記｜日本滑雪場排行榜', url: 'https://natasha-traveler.tw/japan-ski-resort-ranking/', kind: '中文' },
  { name: 'KKday 部落格｜日本滑雪推薦', url: 'https://www.kkday.com/zh-tw/blog/229405/asia-japan-skiing-recommendation', kind: '中文' },
  { name: 'Klook 客路部落格｜日本滑雪場整理', url: 'https://www.klook.com/zh-TW/blog/japan-ski-resorts/', kind: '中文' },
  { name: 'AsiaYo 部落格｜熱門日本雪場攻略', url: 'https://blog.asiayo.com/2025/11/20/archives/51550/', kind: '中文' },
  { name: '客來思樂｜日本滑雪場推薦（交通、雪質、難度、中文教練）', url: 'https://www.callingtaiwan.com.tw/japan-ski-resort/', kind: '中文' },
  { name: 'kuolife｜日本新手滑雪雪場選擇攻略', url: 'https://kuolife.com/japan-ski-resort-recommendation-for-novice/', kind: '中文' },
  { name: '福妞帶你玩｜日本滑雪新手攻略', url: 'https://blog.lifetour.com.tw/?p=3751', kind: '中文' },
  { name: 'Holafly｜日本滑雪場精選', url: 'https://esim.holafly.com/zh/travel-tips/japan-ski/', kind: '中文' },
  { name: 'SnowJapan（日本全雪場資料庫，1999 年起）', url: 'https://www.snowjapan.com/', kind: '英文' },
  { name: 'Powderhounds（日本雪場比較與評分）', url: 'https://www.powderhounds.com/Japan.aspx', kind: '英文' },
] as const;

export const RESORTS: Resort[] = [
  // ══════════ 新潟・長野（從東京進出）══════════
  {
    id: 'gala',
    name: 'GALA 湯澤',
    nameJa: 'GALA湯沢',
    prefecture: '新潟',
    gateway: 'tokyo',
    access: '東京站搭上越新幹線約 71 分鐘直達「GALA 湯澤站」，車站直接連通滑雪中心',
    levels: ['beginner', 'intermediate'],
    priorities: ['short', 'value', 'family', 'language'],
    why: '全日本極少數「新幹線車站就是滑雪場」的地方 —— 出站即是售票、租借、置物櫃與溫泉，不用轉車也不用扛雪具走路。中級雪道佔比最高，官網有完整繁體中文版，還有全中文教學的雪校。行程只有兩三天、或想安排一日滑雪的人，效率無人能敵。',
    caution:
      '沒有雪道旁的住宿（純日歸型雪場），要住越後湯澤站周邊。也沒有托兒服務 —— 山頂的 Kids Room 是付費預約的休息室，現場沒有人員照看。',
    officialUrl: 'https://gala.co.jp/zh-CHT/winter/',
    medicalAnchor: 'yuzawa',
    park: {
      has: true,
      detail:
        "官網「GALA SNOW PARK」在北エリア，分三區：ステップアップパーク（初學者用的小型跳台與 jib）、地形フリーライドパーク、キッカーゾーン（中上級的高難度跳台）。春季另有コブ（蘑菇）地形。未見 half-pipe。",
      kidsPark: "「ゆきあそびパーク」：雪橇專用道與自由雪遊區，有雪上電扶梯，與公園分開。",
      source: "https://gala.co.jp/winter/activities",
      sourceLabel: "GALA湯沢 官方 アクティビティ頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 35,
      intermediate: 45,
      advanced: 20,
      level: 'official',
      source: 'https://gala.co.jp/winter/gelande/',
      sourceLabel: 'GALA 湯澤官方雪道頁',
      checkedAt: '2026-09-13',
    },
    family: {
      childcare: null,
      kidsFacilities: '兒童滑雪學校（雙板 4–12 歲、單板 6–12 歲）；山頂有雪橇專用的「雪遊樂園」',
      kidsTicket: '小學生 ¥3,000；未就學兒童免費（每位大人可帶 2 名）；每月第三個週日小學生一日券免費',
      rating: 'medium',
      source: 'https://gala.co.jp/winter/charges',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文', '簡體中文', '泰文'],
      hasTraditionalChinese: true,
      englishService: 'CANYONS SNOW SPORTS SCHOOL 提供英語課程',
      chineseInstructor: 'GIANT SKI SCHOOL 全中文教學（含 3–6 歲幼兒私人課）；CANYONS 提供普通話與廣東話',
      source: 'https://gala.co.jp/winter/school',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'none',
      detail:
        '雪場本身沒有任何住宿，是純日歸型雪場。住宿集中在越後湯澤站周邊的溫泉旅館，每天搭新幹線一站或接駁車上山。不過 GALA 湯澤站直接連通滑雪中心，扛雪具的距離其實比很多雪場短。',
      sourceLevel: 'official',
      source: 'https://gala.co.jp/zh-CHT/winter/',
      sourceLabel: 'GALA 湯澤官方（設施一覽未列住宿）',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 6500,
      childYen: 3000,
      season: '2025-26',
      tier: 'low',
      note: '官網基準價 ¥6,500，但另有調查顯示特定日可達 ¥7,300，實際請以官網當日票價為準',
      source: 'https://gala.co.jp/winter/charges',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'karuizawa',
    name: '輕井澤王子',
    nameJa: '軽井沢プリンス',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京站搭北陸新幹線約 70–80 分鐘到輕井澤站，南口出站即到（步行約 10 分或免費接駁）',
    levels: ['beginner'],
    priorities: ['short', 'family', 'language'],
    why: '初級雪道近六成、坡度平緩、以人工造雪為主所以雪況穩定，是台灣人最常選的「第一次上雪」地點。小學生以下雪票免費、三座兒童雪地樂園、官網有繁體中文、雪校有全中文課程。旁邊就是 Outlet，不滑雪的同行者完全不會無聊。',
    caution:
      '標高差只有 215 公尺、面積 30 公頃，是這份清單裡規模最小的。票價卻是偏高的一級 —— 它的價值在「交通近、晴天多、小孩免費、有 Outlet」，不在雪量和地形。中級以上很快會覺得不夠滑。',
    officialUrl: 'https://www.princehotels.com/zh-hant/ski/karuizawa/',
    park: {
      has: true,
      detail:
        "官網列出「くりの木パーク」（3 公尺 table top、寬 box、roll）與初學者用的「デビューパーク」。規模小、以入門級道具為主；官網未載明 half-pipe 或コブ。",
      kidsPark: "「スノーマンパーク」三處：雪橇專用坡、雪胎、旋轉木馬、雪上電扶梯。",
      source: "https://www.princehotels.co.jp/ski/karuizawa/winter/coursemap/",
      sourceLabel: "軽井沢プリンス 官方 ゲレンデ・コース頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 58,
      intermediate: 21,
      advanced: 21,
      level: 'secondary',
      source:
        'https://www.snowjapan.com/japan-ski-resorts/nagano/karuizawa/karuizawa-prince-hotel',
      sourceLabel: 'SnowJapan',
      checkedAt: '2026-09-13',
    },
    family: {
      childcare: null,
      kidsFacilities:
        '三座「雪人樂園」（雪橇坡、旋轉木馬、魔毯、雪上輪胎）、初學者專區，以及 3–9 歲的兒童滑雪學校',
      kidsTicket: '小學生以下雪票免費',
      rating: 'high',
      source: 'https://www.princehotels.co.jp/ski/karuizawa/winter/family/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文'],
      hasTraditionalChinese: true,
      englishService: '四所雪校合計提供英文課程',
      chineseInstructor: '官方繁中站載明有雪校提供全中文的雙板與單板課程',
      source: 'https://www.princehotels.com/zh-hant/ski/karuizawa/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'partial',
      detail:
        '輕井澤王子大飯店就在雪場旁，但官方頁面沒有標示「雪道直結」。旅遊業者的資料寫的是步行約 5–10 分鐘，或搭飯店園區內的接駁車 —— 距離很近，但不是穿著雪靴走出大門就能滑。',
      sourceLevel: 'official',
      source: 'https://www.princehotels.co.jp/karuizawa-west/facility/ski/',
      sourceLabel: '輕井澤王子大飯店 WEST 官方',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 10000,
      childYen: 0,
      season: '2025-26',
      tier: 'high',
      note: '正規期 ¥10,000；特定日 ¥12,000、年末年始等最繁忙日 ¥13,000。小學生以下免費',
      source: 'https://www.princehotels.co.jp/ski/karuizawa/winter/lift/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'naeba',
    name: '苗場',
    nameJa: '苗場',
    prefecture: '新潟',
    gateway: 'tokyo',
    access: '東京站搭新幹線到越後湯澤站約 1 小時 20 分，再轉巴士約 50 分鐘，全程約 2.5 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['family', 'onsen', 'language'],
    why: '飯店正面就是雪道，標高差 889 公尺、地形從初級到上級都完整，還可以搭日本最長的纜車車廂連通到神樂雪場。小學生以下雪票免費、有天然溫泉大浴場與室內商店街，下雨天也有地方去。',
    caution:
      '交通一定要轉 50 分鐘巴士，沒有新幹線直達。中文與英文教練人數有限，官方自己都建議要提前預約。',
    officialUrl: 'https://www.princehotels.com/zh-hant/ski/naeba/',
    medicalAnchor: 'yuzawa',
    park: {
      has: true,
      detail:
        "官網列「苗場スノーパーク」（第 5 高速リフト旁、初中級，10:00–16:00），FAQ 稱全 24 條雪道加 1 座公園；另有上級的「ワールドカップモーグルバーン」（222 公尺、最大 30.57 度的蘑菇道）。未載明 half-pipe。",
      kidsPark: "付費的「わくわくファミリースノーランド」：雪上電扶梯、雪胎、充氣遊具、雪橇專用小坡（雪橇禁止在一般雪道使用）。",
      source: "https://www.princehotels.co.jp/ski/naeba/winter/coursemap/",
      sourceLabel: "苗場スキー場 官方 ゲレンデ・コース頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 30,
      intermediate: 40,
      advanced: 30,
      level: 'secondary',
      source: 'https://www.snowjapan.com/japan-ski-resorts/niigata/yuzawa/naeba',
      sourceLabel: 'SnowJapan',
      checkedAt: '2026-09-13',
      missingNote:
        '官方只公布雪道條數（初級 9 條、中級 6 條、上級 9 條，共 24 條），沒有公布百分比。',
    },
    family: {
      childcare: null,
      kidsFacilities: '兒童專屬的滑雪學校，以及冬季限定的親子雪地樂園（雪橇、雪上小火車、充氣城堡等）',
      kidsTicket: '小學生以下雪票免費（需到售票處換取專用券）',
      rating: 'high',
      source: 'https://www.princehotels.co.jp/ski/naeba/winter/lift/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文'],
      hasTraditionalChinese: true,
      englishService: 'Sherpa International Ski School 提供英文課程',
      chineseInstructor: 'Sherpa International Ski School 提供中文課程，但官方註明人數有限、強烈建議提前預約',
      source: 'https://www.princehotels.com/zh-hant/ski/naeba/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        '苗場王子大飯店官方標示「雪道直結、步行 0 分鐘」，約 1,200 間客房緊鄰雪道，是本州規模最大的雪道直結飯店之一。',
      sourceLevel: 'official',
      source: 'https://www.princehotels.co.jp/naeba/',
      sourceLabel: '苗場王子大飯店官方',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 7800,
      childYen: 0,
      season: '2025-26',
      tier: 'mid',
      note: '苗場區域一日券 ¥7,800；含神樂的 Mt. Naeba 共通券 ¥9,800。小學生以下免費',
      source: 'https://www.princehotels.co.jp/ski/naeba/winter/lift/',
      checkedAt: '2026-09-13',
    },
  },

  // ══════════ 長野（白馬・志賀・野澤）══════════
  {
    id: 'hakuba',
    name: '白馬',
    nameJa: '白馬',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線再轉巴士約 3.5–4.5 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['language', 'onsen', 'powder'],
    why: '由多個雪場組成，地形從緩坡到 8 公里長距離巡航都有，一張通票可以跑好幾個場地，適合停留多天。也是本州少數有全英語滑雪學校與全英語診所的區域，語言負擔低。',
    caution:
      '2026-27 雪季進入「一日券萬元時代」，是日本最貴的一線。八方尾根官網只有日文與英文，三個主要雪場中只有栂池高原提供繁體中文。',
    officialUrl: 'https://www.hakubavalley.com/en/',
    medicalAnchor: 'hakuba',
    park: {
      has: true,
      detail:
        "四個主要雪場都有公園：八方尾根「HAPPO PARKS」（以 bank、wave 地形為主，最多 20 個道具）、兎平・黒菱是有名的蘑菇道；五龍「GORYU PARK」（4–9 段 jib）、GORYU WAVES、常設蘑菇道 GORYU BUMPS；Hakuba47「47PARKS」（跳台、jib、cross，10 個以上道具，超初級到上級）；栂池「TG PARKS」（跳台、jib、banked，最多 40 個道具）。",
      kidsPark: "八方「なきやまスノーランド」（雪橇＋輸送帶）；五龍「そりエリア」與「STEP UP LAND」；栂池「キッズパーク」（70×70 公尺、動く歩道）。",
      source: "https://www.hakuba47.co.jp/winter/area/snowpark/",
      sourceLabel: "Hakuba47 官方 スノーパーク頁（另參各雪場官網）",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 30,
      intermediate: 50,
      advanced: 20,
      level: 'official',
      source: 'https://www.happo-one.jp/en/gelande/',
      sourceLabel: '八方尾根官方英文站',
      checkedAt: '2026-09-13',
      representing: '八方尾根',
      missingNote:
        'Hakuba Valley 十個雪場並未公布整體比率，這裡以規模最大的八方尾根為代表。栂池高原初級比例較高（約五成，第三方資料），適合新手。',
    },
    family: {
      childcare: '八方尾根的 Evergreen International Ski School 附設托兒（收托年齡未公布）',
      kidsFacilities: '八方尾根有兒童分級課程；栂池高原設有 KIDS PARK',
      kidsTicket: '八方尾根 5 歲以下免費；栂池 6 歲以下免費（每位大人限 1 名）；五龍每月第三個週日小學生以下免費',
      rating: 'medium',
      source: 'https://www.happo-one.jp/en/school/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文（八方尾根）', '中文（五龍）', '繁體中文（栂池）'],
      hasTraditionalChinese: true,
      englishService:
        'Evergreen International Ski School（自 2000 年營運的全英語滑雪學校，提供成人、兒童課程與托兒）',
      chineseInstructor: null,
      source: 'https://www.happo-one.jp/en/school/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        '有，但要挑。八方尾根的 STARRY RESIDENCE SUITE 雪道直結，Cortina 的 Hotel Green Plaza 白馬、栂池的「ひらた」也在雪道正前方。但白馬是由十個獨立雪場組成的區域，多數住宿在村內，要搭接駁車往返 —— 訂房前務必確認是哪個雪場、哪條雪道旁。',
      sourceLevel: 'secondary',
      source: 'https://www.go-nagano.net/accommodation/id20665',
      sourceLabel: 'Go! NAGANO 長野縣官方觀光網站',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 9800,
      childYen: 4900,
      season: '2026-27',
      tier: 'high',
      note: '八方尾根旺季價。五龍＋Hakuba47 共通券 ¥10,000、栂池 ¥9,800。早鳥與春季票價明顯較低',
      source: 'https://www.happo-one.jp/en/ticket/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'shigakogen',
    name: '志賀高原',
    nameJa: '志賀高原',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線再轉巴士約 3–4 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['onsen', 'value', 'family'],
    why: '一張共通券可以滑 18 個雪場、47 條以上纜車，海拔高、雪況穩定。托兒服務收托三個月以上的幼兒，是這份清單裡門檻最低的；還有多座免費的兒童雪地樂園。想「滑不完」或帶很小的小孩，這裡最划算。',
    caution:
      '區域非常大而且分散，第一次去容易迷路，建議先查好纜車路線圖。官網只有日文與英文，沒有中文版。',
    officialUrl: 'https://shigakogen-ski.or.jp/english/',
    park: {
      has: false,
      detail:
        "志賀高原索道協会官網與各雪場頁都沒有 terrain park（沒有跳台、jib、half-pipe 的記述）。有的是自然地形與蘑菇：焼額山 D3 中級道為非壓雪蘑菇斜面、A6 也有蘑菇。對不想碰公園地形的家庭來說，這是優點。",
      kidsPark: "丸池スノーランド、ヤケビスノーパーク（免費、有輸送帶與雪橇）、奥志賀キッズパーク；熊の湯有雪橇小坡。",
      source: "https://www.princehotels.co.jp/ski/shiga/winter/coursemap/",
      sourceLabel: "志賀高原 焼額山 官方 ゲレンデ頁（另參 shigakogen-ski.or.jp）",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: null,
      intermediate: null,
      advanced: null,
      missingNote:
        '志賀高原是 18 個獨立雪場共用一張票，官方只逐區公布、沒有全山數字。各區差異很大 —— 奧志賀高原初級約 49%，Sun Valley 初級只有 20%。用單一數字反而會誤導。',
    },
    family: {
      childcare: '高天原托兒所收托三個月以上的未就學幼兒，有 3 小時與 5 小時課程，建議提前一週預約',
      kidsFacilities:
        '丸池 Snowland（附輸送帶）、奧志賀 Kids Park 與燒額山家庭雪park（後兩者免費入場）；另有 4–12 歲的兒童滑雪課',
      kidsTicket: '每月第三個週日小學生以下纜車全日免費；另有「大人＋小孩」一日套票',
      rating: 'high',
      source: 'https://shigakogen-ski.or.jp/english/kids/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文'],
      hasTraditionalChinese: false,
      englishService:
        'Shiga Kogen International Ski School、Skiwi Ski School、Sugiyama Ski & Snowsports School 等三所提供英語課程',
      chineseInstructor: null,
      source: 'https://www.shigakogen.gr.jp/english/topics/ski-snowboard-schools.html',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        '雪道直結的住宿非常多，是這份清單裡選擇最豐富的。志賀高原王子大飯店東、南、西三館全部直結燒額山雪場；奧志賀的 Hotel Grand Phenix 可以穿著雪板直接進出。',
      sourceLevel: 'secondary',
      source: 'https://www.go-nagano.net/accommodation/id20600',
      sourceLabel: 'Go! NAGANO 長野縣官方觀光網站',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 9500,
      childYen: 4000,
      season: '2026-27',
      tier: 'mid-high',
      note: '共通券一票通 18 個雪場。單價略低於白馬，但就「每一塊錢能滑到的範圍」是日本最划算的之一',
      source: 'https://shigakogen-ski.or.jp/winter/ticket/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'nozawa',
    name: '野澤溫泉',
    nameJa: '野沢温泉',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線再轉巴士約 2.5–3.5 小時',
    levels: ['intermediate', 'advanced'],
    priorities: ['onsen', 'powder', 'value'],
    why: '雪場加上老溫泉街，滑完可以直接走進村子泡免費外湯。297 公頃、44 條雪道的規模仍屬日本前段，票價卻是這份清單長野三場中最便宜的，性價比最好。日式風情濃，是很多人心中「日本滑雪」的原型。',
    caution:
      '雪道坡度變化大，初學者的活動範圍相對有限。官網沒有中文版，而且官方票務頁明載網路購票只有日文介面 —— 對不懂日文的人是實際障礙。',
    officialUrl: 'https://en.nozawaski.com/',
    park: {
      has: true,
      detail:
        "官網「上ノ平スノーパーク」全長約 2 公里（標高 1,220–1,410 公尺）：小／中／大跳台、6 公尺 box、8 公尺 flat-down box、連續 wave、油桶，以及 half-pipe（寬 8 公尺、高 3.5 公尺、長 110 公尺）；春季另有春山パーク。初學到上級都有對應。",
      kidsPark: "日影ゲレンデ「キッズパーク」：免費雪橇區（日影與やまびこ兩處）、充氣遊具、ナスキーウェイ（付費）。",
      source: "https://nozawaski.com/winter/course/park/",
      sourceLabel: "野沢温泉スキー場 官方 スノーパーク頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 40,
      intermediate: 30,
      advanced: 30,
      level: 'secondary',
      source: 'https://www.yukiguni-journey.jp/en/37918/',
      sourceLabel: '雪國觀光媒體',
      checkedAt: '2026-09-13',
      missingNote: '這組數字流傳很廣，但官網雪道頁只列即時運行狀況（44 條雪道、18 部纜車），沒有直接公布百分比。',
    },
    family: {
      childcare: '日影的托兒中心收 1–6 歲，上下午分段、中午需接回，限收 20 名須預約（第三方資料，出發前請致電確認）',
      kidsFacilities: '托兒中心正前方有 Kids Park（雪盆滑道、充氣城堡等）',
      kidsTicket: '未就學兒（5 歲以下）免費，每位付費大人限帶 1 名，且不發實體票',
      rating: 'medium',
      source: 'https://en.nozawaski.com/the-mountain/lift-ticket/ticket-prices/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文'],
      hasTraditionalChinese: false,
      englishService: '村內有多家外籍經營的業者提供英語滑雪課、租借與保母服務；托兒中心亦有英語人員',
      chineseInstructor: null,
      source: 'https://en.nozawaski.com/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'partial',
      detail:
        '大多數住宿在溫泉街裡，不是雪道直結。長野縣官方觀光網站列出的例子，是步行約 5 分鐘到「遊ロード」電動步道、約 9 分鐘到長坂纜車站。好處是晚上泡外湯、逛溫泉街都走路就到。',
      sourceLevel: 'secondary',
      source: 'https://www.go-nagano.net/accommodation/id20665',
      sourceLabel: 'Go! NAGANO 長野縣官方觀光網站',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 7800,
      childYen: 4700,
      season: '2026-27',
      tier: 'mid',
      note: '旺季正規價。比白馬便宜約 ¥2,000，規模卻仍屬日本前段',
      source: 'https://en.nozawaski.com/the-mountain/lift-ticket/ticket-prices/',
      checkedAt: '2026-09-13',
    },
  },

  // ══════════ 北海道 ══════════
  {
    id: 'niseko',
    name: '二世谷',
    nameJa: 'ニセコ',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士約 2.5–3 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['powder', 'language'],
    why: '日本最國際化的雪場區域，以乾燥粉雪聞名。四個相連的雪區性格不同：Annupuri 與 Niseko Village 偏初中級，HANAZONO 以中級為主，比羅夫的上級地形最多。醫療端也有中英文診所，語言負擔在日本雪場裡最低。',
    caution:
      '票價是日本最高的一級（旺季全山券 ¥13,500）。另外要注意：官方掛名的五所雪校都沒有標示中文教學，市面上的中文雪校多為第三方業者。',
    officialUrl: 'https://www.niseko.ne.jp/en/',
    medicalAnchor: 'niseko',
    park: {
      has: true,
      detail:
        "HANAZONO 有三座公園：Gondola Park（3–8 公尺跳台、box、rail）、Hanazono Park（8–12 公尺跳台，中上級）、Hana2 Mini Park（入門 box／rail）。Grand Hirafu 官網只在春季段落提到有跳台與道具的公園，沒有細節；Annupuri 與 Village 官網查無公園。想避開公園地形的家庭可以選 Annupuri 或 Village。",
      kidsPark: "HANAZONO 有 Tube Park 與室內 Galaxy of Kidz；Hirafu 現行官網沒有獨立的兒童雪上樂園；Annupuri、Village 官網未見雪橇專區（Village 只有 Kids Club 托兒）。",
      source: "https://hanazononiseko.com/en/winter/resort/terrain-parks",
      sourceLabel: "HANAZONO 官方 Terrain Parks 頁（另參其他三區官網）",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 41,
      intermediate: 27,
      advanced: 32,
      level: 'official',
      source: 'https://www.grand-hirafu.jp/snow/',
      sourceLabel: '二世谷東急 Grand Hirafu 官方',
      checkedAt: '2026-09-13',
      representing: 'Grand Hirafu（比羅夫）',
      missingNote:
        'Niseko United 官方沒有公布全山比率，這裡以比羅夫官方公布的雪道條數（初級 9、中級 6、上級 7）換算。其他三區的性格不同：Annupuri 與 Niseko Village 偏初中級，HANAZONO 以中級為主。',
    },
    family: {
      childcare:
        'HANAZONO 的 Niseko Kids Club 收 12 個月～6 歲、有多語工作人員；Niseko Village Kids Club 收 1.5～9 歲，每日限 20 人',
      kidsFacilities:
        '3–6 歲的兒童滑雪學校、HANAZONO 室內攀爬中心與雪胎公園、Niseko Village 室內遊戲中心',
      kidsTicket: '4–12 歲旺季 ¥8,100。官方票價頁沒有標示任何免費年齡，級距從 4 歲起算',
      rating: 'medium',
      source: 'https://www.niseko.ne.jp/en/niseko-kids/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文（比羅夫官網）', '簡體中文（比羅夫官網）'],
      hasTraditionalChinese: true,
      englishService: '官方掛名的五所雪校皆以英語授課，其中 Niseko Village 標示為多語國際認證教練',
      chineseInstructor:
        '官方明文的中文服務只有 Niseko Village Kids Club（英語與中文教練）。市面上的中文雪校為第三方業者，無法在官方頁面驗證',
      source: 'https://www.niseko.ne.jp/en/niseko-ski-school/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        'Hilton 二世谷村官方寫明「走出大門就是雪道」，一樓免費寄放雪具。比羅夫（Grand Hirafu）一帶也有多家雪道直結的飯店與公寓。不過二世谷住宿選擇非常多，也有不少在村內需要搭接駁車的，訂房時要看清楚。',
      sourceLevel: 'official',
      source: 'https://nisekovillage.hiltonjapan.co.jp/activity/winter-information',
      sourceLabel: 'Hilton 二世谷村官方',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 13500,
      childYen: 8100,
      season: '2026-27',
      tier: 'high',
      note: '全山共通券旺季價。一般期 ¥12,600、初滑與春季 ¥8,800、最終期 ¥6,300',
      source: 'https://www.niseko.ne.jp/en/lift/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'rusutsu',
    name: '留壽都',
    nameJa: 'ルスツ',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士約 1.5–2 小時',
    levels: ['intermediate', 'advanced'],
    priorities: ['powder', 'family', 'onsen'],
    why: '三座山、37 條雪道、總滑走距離 42 公里，樹林地形是最大特色，人潮比二世谷少。度假村型態，吃住滑都在同一區內；托兒收滿一歲的幼兒，還有室內造波泳池和三處溫泉，下雪天不滑雪也有地方去。',
    caution:
      '樹林區對中階以下有難度，第一次去建議先待在整理過的雪道上。票價的窗口牌價（¥16,700）是日本最高一級，但線上預售 ¥13,200 才是實際常見價位 —— 一定要先線上買。官網只有簡體中文，沒有繁體版，而且官方明文說雪校課程不提供日語英語以外的語言。',
    officialUrl: 'https://rusutsu.com/en/',
    park: {
      has: true,
      detail:
        "官網「フリーダムパーク」在イーストMt.，分三線：中上級線（8–12 公尺與 5–8 公尺二連跳台、rail、box，3 月增設 15 公尺大跳台）、easy 線（1–3 公尺 table top、寬 box）、bank 線。營運約 12 月下旬到 3 月中旬，10:00–16:00。未載明 half-pipe。",
      kidsPark: "ウエストMt.「サムライキッズパーク」：雪胎與雪橇等雪遊設施。",
      source: "https://rusutsu.com/terrain-parks/freedom-park/",
      sourceLabel: "ルスツリゾート 官方 フリーダムパーク頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: null,
      intermediate: null,
      advanced: null,
      missingNote:
        '官方雪道圖只逐條列出雪道、沒有彙總統計。非官方版本的計算基礎還互相不同 —— 有的按雪道條數、有的按滑走距離（易 31%／中 40%／難 29%），無法直接比較，所以這裡不給單一數字。',
    },
    family: {
      childcare: '度假村附設保育園收滿 1 歲到學齡前，09:00–17:00，每小時 ¥2,000，完全預約制（前一日 18:00 前）',
      kidsFacilities: '4–7 歲兒童滑雪學校；West Mt. 的兒童雪園（2 歲以下免費）',
      kidsTicket: '3 歲以下纜車免費；4–12 歲一般季窗口 ¥8,300、線上 ¥6,400',
      rating: 'high',
      source: 'https://rusutsu.com/nursery-school/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '簡體中文', '韓文'],
      hasTraditionalChinese: false,
      englishService: 'International Ski School 提供英語課程',
      chineseInstructor: null,
      source: 'https://rusutsu.com/en/international-ski-lessons/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        '留壽都度假村飯店正對 West Mountain 雪道，雪道直結；山頂有兒童雪園與初級雪道。飯店、溫泉、室內造波泳池都在同一區，整趟行程幾乎不用搭車。',
      sourceLevel: 'official',
      source: 'https://rusutsu.com/rusutsu-resort-hotel-and-convention/',
      sourceLabel: '留壽都度假村官方',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 13200,
      childYen: 6400,
      season: '2026-27',
      tier: 'high',
      note: '這裡列的是線上預售價。窗口牌價高得多（大人 ¥16,700、兒童 ¥8,300），務必先線上購買',
      source: 'https://rusutsu.com/winter-lift-tickets/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'furano',
    name: '富良野',
    nameJa: '富良野',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '旭川機場搭巴士約 1 小時',
    levels: ['beginner', 'intermediate'],
    priorities: ['powder', 'value', 'family', 'language'],
    why: '雪質好、雪道整理得整齊、人潮比二世谷少，價格也親切得多。語言服務是這份清單裡最完整的 —— 官網有完整繁體中文版，而且官方直接掛牌了一所中文／廣東話的雪校。小學生以下纜車全免，帶小孩的實質成本最低。',
    caution: '官方頁面查無托兒服務，帶很小的小孩需要自己安排。',
    officialUrl: 'https://www.princehotels.com/zh-tw/ski/furano/',
    park: {
      has: false,
      detail:
        "官網雪道頁沒有任何 terrain park（「パーク」分頁的內容是 FURANO スノーランド，屬雪上摩托車與雪上泛舟活動區，不是跳台或 rail）。但官方明列蘑菇道：E1（粉雪＆蘑菇、25 度）、K2（非壓雪蘑菇、34 度）、K3（上級蘑菇）。",
      kidsPark: "「FURANO スノーランド」為家庭活動區（雪上摩托、雪上泛舟、香蕉船），官網未載明雪橇專用區。",
      source: "https://www.princehotels.co.jp/ski/furano/winter/coursemap/",
      sourceLabel: "富良野スキー場 官方 ゲレンデ・コース頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 50,
      intermediate: 36,
      advanced: 14,
      level: 'official',
      source: 'https://www.princehotels.co.jp/ski/furano/winter/coursemap/',
      sourceLabel: '富良野官方雪道表',
      checkedAt: '2026-09-13',
      missingNote:
        '官方沒有直接印出百分比，這是由官方雪道分類表逐條清點換算（全 28 條：初級 14、中級 10、上級 4）。專業站 SnowJapan 另給 40／40／20，與清點結果有出入。',
    },
    family: {
      childcare: null,
      kidsFacilities:
        '3–6 歲的兒童雪校（對應日語、英語、中文）；小學 1–4 年級與幼兒私人課；飯店步行 2 分鐘有雪上活動區',
      kidsTicket: '小學生以下纜車票全免 —— 這份清單裡最優的兒童優惠',
      rating: 'high',
      source: 'https://www.princehotels.co.jp/ski/furano/winter/lift/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文', '簡體中文', '韓文'],
      hasTraditionalChinese: true,
      englishService: '兒童雪校對應英語',
      chineseInstructor:
        '官方掛牌的「富良野中文教室」提供中文與廣東話課程，初級到高級皆有；兒童雪校也對應中文',
      source: 'https://www.princehotels.com/zh-tw/ski/furano/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        '新富良野王子大飯店官方標示「到雪道 0 分鐘」，館內就有雪具租借，可以空手 ski-in / ski-out。',
      sourceLevel: 'official',
      source: 'https://www.princehotels.co.jp/shinfurano/contents/stay/winter.html',
      sourceLabel: '新富良野王子大飯店官方',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 8000,
      childYen: 0,
      season: '2025-26',
      tier: 'mid',
      note: '旺季價。初滑與春季 ¥6,500。小學生以下免費，所以帶小孩的家庭實質單位成本是這份清單裡最低的。2026-27 價格尚未公布',
      source: 'https://www.princehotels.co.jp/ski/furano/winter/lift/',
      checkedAt: '2026-09-13',
    },
  },
  {
    id: 'tomamu',
    name: '星野度假村 TOMAMU',
    nameJa: '星野リゾート トマム',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士或鐵路約 1.5–2 小時',
    levels: ['beginner', 'intermediate'],
    priorities: ['family', 'language', 'value'],
    why: '典型的一站式度假村：兩家飯店雪道直結，加上日本最大級的室內造波泳池、愛絲冰城與 ski-in/ski-out 商店街，帶小孩或長輩時移動負擔最小。托兒收滿五個月的嬰兒，是這份清單裡門檻最低的；官網有繁體中文，官方也明文表示有中文教練。',
    caution:
      '⚠️ 當地的村立診療所只有內科與小兒科，沒有整形外科。骨折、韌帶等運動傷害需要往富良野方向後送，車程不短 —— 在這裡受傷時不要想著「撐到隔天再說」。另外飯店的「木林之湯」官方明言不是溫泉。',
    officialUrl: 'https://www.snowtomamu.jp/winter/cn/',
    medicalAnchor: 'tomamu',
    park: {
      has: true,
      detail:
        "官網「トマムスロープスタイルパーク」稱北海道最大級：初級／中級／上級三條線，jib 區在トマムエクスプレス山麓，跳台需先 speed check，雪道上還有「シークレットジャンプ」。營運 12 月下旬到 3/31，9:30–15:30。另有初學者蘑菇道與蘑菇線。",
      kidsPark: "「アドベンチャーマウンテン」是故事主題的家庭滑雪區（要穿雪具），官網未載明雪橇專用的雪遊園。",
      source: "https://www.snowtomamu.jp/winter/ski/ski-slope/slopestyle/",
      sourceLabel: "星野リゾート トマム 官方 スロープスタイルパーク頁",
      checkedAt: '2026-09-15',
    },
    difficulty: {
      beginner: 38,
      intermediate: 48,
      advanced: 14,
      level: 'secondary',
      source: 'https://www.snowtomamu.jp/winter/ski/ski-slope/',
      sourceLabel: '由官方雪道一覽表清點',
      checkedAt: '2026-09-13',
      missingNote:
        '官方四種語言版本都沒有公布比率，這是由官方雪道一覽表逐條清點（全 29 條）。專業站 SURF&SNOW 另給 35／45／20。可確定的是約 86% 的雪道屬中級以下，對初中級者友善。',
    },
    family: {
      childcare:
        '托兒服務收滿 5 個月的嬰兒起，10:00–17:00 另有夜間時段，須 5 日前預約 —— 這份清單裡收托年齡最低的',
      kidsFacilities:
        '兒童雪校（團體 4–12 歲、私人 3 歲起）；日本最大級的室內造波泳池（住客免費，附水深 30 公分兒童池）；冬季限定的愛絲冰城含兒童冰迷宮',
      kidsTicket: '6 歲以下纜車免費。注意 12 歲起即算大人票，沒有青少年級距',
      rating: 'high',
      source: 'https://www.snowtomamu.jp/winter/family/',
      checkedAt: '2026-09-13',
    },
    language: {
      siteLanguages: ['日文', '英文', '繁體中文', '簡體中文', '韓文'],
      hasTraditionalChinese: true,
      englishService: '雪校官方明文有英語教練',
      chineseInstructor:
        '官方明文「日語、英語、中文教練在籍」。但未說明是普通話或粵語，也未說明能否指定中文教練',
      source: 'https://www.snowtomamu.jp/winter/ski/lesson/',
      checkedAt: '2026-09-13',
    },
    skiInOut: {
      level: 'full',
      detail:
        'RISONARE Tomamu 官方寫明設有「雪道直結的滑雪者入口」，穿上雪板就能直接滑出去，一路滑到纜車，或滑進 Hotaru Street —— 2017 年開幕、日本第一條 ski-in / ski-out 商店街，9 家餐廳與商店沿著雪道中段排開，穿著雪靴就能滑到店門口。注意：同園區的 The Tower 官方頁面沒有標示雪道直結，訂房時要看清楚是哪一館。',
      sourceLevel: 'official',
      source: 'https://www.snowtomamu.jp/winter/topics/resonare-point/',
      sourceLabel: '星野度假村 TOMAMU 官方（RISONARE）',
      checkedAt: '2026-09-13',
    },
    pricing: {
      adultYen: 8000,
      childYen: 6000,
      season: '2025-26',
      tier: 'mid',
      note: '窗口價。線上預售 ¥7,700、住客優惠 ¥7,500。6 歲以下免費。2026-27 價格官方尚未公布',
      source: 'https://www.snowtomamu.jp/winter/ski/ticket/',
      checkedAt: '2026-09-13',
    },
  },
];
