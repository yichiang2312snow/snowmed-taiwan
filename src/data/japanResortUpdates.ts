/**
 * 日本雪場指引的每週更新紀錄
 *
 * 每週由排程任務（scheduled task `japan-resorts-weekly`）上網查證後追加，
 * 頁面上會顯示「最近更新」與每個雪場卡片裡的「近期動態」。
 *
 * ⚠️ 維護規則（跟 japanResorts.ts 一樣）
 * - 每一則都要有 source（實際看到的網址）與 date。
 * - sourceLevel：official = 雪場／飯店／官方觀光單位；secondary = 專業資料站、新聞、部落格。
 *   第三方的內容只能放這裡當「動態」，不能拿去改 japanResorts.ts 裡的數字。
 * - 跟安全有關的（巡邏隊、醫療、纜車異動、雪崩）排在前面，票價與設施其次。
 * - 只留最近 8 週；更舊的刪掉，git 歷史還查得到。
 */

export interface ResortUpdate {
  /** YYYY-MM-DD，查證日 */
  date: string;
  /** 對應 japanResorts.ts 的 id；跟單一雪場無關的整體資訊填 null */
  resortId: string | null;
  /** safety = 巡邏隊／醫療／纜車異動／天候；price = 票價；facility = 設施與服務；season = 開季／營業日期 */
  kind: 'safety' | 'price' | 'facility' | 'season';
  title: string;
  summary: string;
  source: string;
  sourceLabel: string;
  sourceLevel: 'official' | 'secondary';
}

export const RESORT_UPDATES: ResortUpdate[] = [
  // ── 2026-11-23 ──────────────────────────────────────
  {
    date: '2026-11-23',
    resortId: 'furano',
    kind: 'safety',
    title: '富良野：十勝岳噴火警戒 10/16 已由 3 級降為 2 級，雪場官網仍掛著 9 月的 3 級公告',
    summary:
      '氣象廳 2026/9/12 把十勝岳噴火警戒提高到 3 級（入山規制），10/16 10:00 降回 2 級（火口周邊規制），11/20 的解說資料維持 2 級，仍可能發生影響 62-2 火口周邊約 1.5 公里的噴火；需警戒的市町為美瑛町、上富良野町、新得町，富良野市與南富良野町已不在名單內。富良野滑雪場官網雪道頁側欄目前還掛著 9 月「レベル3 引き上げ」的 PDF 公告，開季日仍為 11/28 未變。十勝岳在富良野市區東北方，與雪場所在的北の峰不是同一座山；要去十勝岳溫泉或上富良野方向的人請以氣象廳最新公告為準。',
    source: 'https://www.data.jma.go.jp/vois/data/report/activity_info/108.html',
    sourceLabel: '氣象廳 十勝岳 火山活動解說資料',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'furano',
    kind: 'safety',
    title: '富良野：上級「プレミアムゾーン」因出現裂縫封閉',
    summary:
      '官方雪道頁在北の峰 ZONE 的プレミアムゾーン（非壓雪粉雪上級道，830 公尺、最大 34 度）註明「亀裂が確認されたため滑走不可」，開季起即不開放，何時解除未載明。另外本次逐條核對官方雪道一覽，28 條為初級 11、中級 10、上級 7，本站卡片原本的 50／36／14 是 9 月清點時的錯誤，已更正為 39／36／25。',
    source: 'https://www.princehotels.co.jp/ski/furano/winter/coursemap/',
    sourceLabel: '富良野スキー場 官方 ゲレンデ・コース頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'nozawa',
    kind: 'safety',
    title: '野澤溫泉：官網置頂「乘坐纜車注意事項」—— 背包不要背著上吊椅',
    summary:
      '官方 2026/2/15 發布、目前仍置頂的公告，要求搭吊椅時不得背著背包（放膝上、留意衣物繫繩）、單板要扣流れ止め並放倒 high-back、坐定後拉下安全桿並坐到底、纜車停住時不要跳下、下車後直走。這則公告是在 1 月底栂池高原發生背包肩帶卡住吊椅的死亡事故之後發出的。帶小孩或新手的人出發前可以先一起看過。',
    source: 'https://nozawaski.com/report/39580/',
    sourceLabel: '野沢温泉スキー場 官方公告【重要】リフト乗車時のお願い',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: null,
    kind: 'facility',
    title: '線上購票平台 asoview（アソビュー）會員資料外洩，八方尾根與苗場都發了公告',
    summary:
      'asoview 11/3 公布，委託的電郵發送業者アララ遭不正存取，約 1,582 萬筆會員資料可能外洩（姓名、電郵、電話與購票紀錄；密碼與信用卡資料不含在內）。白馬八方尾根 11/6 公告，透過 asoview 線上購買季票的人會收到 asoview 的通知，請勿回應要求輸入個資或付款的電話、簡訊、郵件；マイナンバーカード早割等一日券不是在 asoview 賣的。苗場 11/5 也發了同主旨的「重要なお知らせ」。TOMAMU 的線上纜車券同樣透過 asoview 販售。近期收到自稱雪場或 asoview 的郵件，先到官網確認。',
    source: 'https://www.happo-one.jp/news/39759/',
    sourceLabel: '白馬八方尾根 官方公告（asoview 事件）',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'hakuba',
    kind: 'season',
    title: '白馬：八方尾根提前到 11/22 開季，目前只開山上的パノラマ，窗口特價 ¥5,000',
    summary:
      '原定 12/1 開季，因 11 月中降雪（兎平積雪 261 公分），八方尾根 11/21 11:00 預開、11/22 正式開季。目前只開パノラマゲレンデ（含初學者道），山麓不能滑，上下山都要搭纜車（上行末班 14:00、パノラマ道 15:10 關閉）。特價一日券大人 ¥5,000、6–17 歲 ¥2,500，只在ゴンドラ山麓站窗口販售，滑走範圍擴大後就會改回正規票價。五龍 11/21 開季；Hakuba47 11/27 起全面開放（LineE 吊椅 11/27 停駛一天）。八方の湯、みみずくの湯 11/18–20 因泉源泵更換暫停營業。',
    source: 'https://www.happo-one.jp/news/36487/',
    sourceLabel: '白馬八方尾根 官方開季公告',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'shigakogen',
    kind: 'season',
    title: '志賀高原：熊の湯已有吊椅運行，12/5 開季週末有 ¥5,000 特別券',
    summary:
      '官網 11/23 的運行表顯示熊の湯第 2 ペア A・B 線已經運行，奧志賀的纜車與吊椅在準備中，其餘仍關閉。正式開季日 12/5（焼額山王子官網另寫 12/4 預開），開季慶 12/5–6 兩天的一日券大人 ¥5,000、兒童 ¥2,500。共通券一日券 ¥9,500／¥4,000 與初滑・春滑連日券 ¥7,500／¥3,000 都和上次查證相同。官方英文 kids 頁的托兒所與兒童雪園日期還停在 2023–25 年的舊資料，請以日文頁或電話確認。',
    source: 'https://shigakogen-ski.or.jp/',
    sourceLabel: '志賀高原索道協会 官網（運行狀況與公告）',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'gala',
    kind: 'season',
    title: 'GALA 湯澤：12/19 開滑，12/12–18 只開觀光纜車、不能滑雪',
    summary:
      '官方營業期間：12/12–12/18 為「観光営業」，無論積雪都不開放滑雪；ゲレンデ營業 2026/12/19–2027/5/5。早割一日券 ¥4,800 賣到 11/30 23:00；正規一日券 ¥8,000／小學生 ¥4,000，WEB 預購 ¥7,500／¥3,500。官網改版後：舊的雪校頁與票價頁都轉址，新雪校頁列出巨人滑雪學校（英語、中文、廣東話）與 SORA International（英語、泰語、中文），先前的 CANYONS 已不在名單；活動頁也不再有公園段落，本站卡片的來源網址已跟著更新。南區整季休止的公告仍在。',
    source: 'https://gala.co.jp/winter/hours-pricing/',
    sourceLabel: 'GALA湯沢 官方 営業時間・料金頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'naeba',
    kind: 'season',
    title: '苗場：12/18 開季、龍纜車 12/26 起運行，飯店整修到 12/10',
    summary:
      '官方公布 2026/12/18–2027/4/4 營業，夜滑 12/18–3/21，連接神樂的ドラゴンドラ 12/26–3/22（8 小時券與 4 小時券不能搭）。苗場王子大飯店 11/8–12/10 整修休館，12/11 起營業。票價不變：苗場區域一日券 ¥9,800、Mt. Naeba 共通券 ¥11,800，小學生以下免費。官方雪道頁 24 條目前列為初級 10、中級 6、上級 8（9 月時為 9／6／9），另新增「スプリット 20 時間券」。',
    source: 'https://www.princehotels.co.jp/ski/naeba/winter/lift/',
    sourceLabel: '苗場スキー場 官方リフト券頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'niseko',
    kind: 'facility',
    title: '二世谷：11/28 開季；比羅夫 A3 吊椅改 4 人座、Village 新纜車第一段本季啟用',
    summary:
      'Niseko United 官方：線上購票 11/4 開賣，開季期（11/28–12/11）的票不在網路上賣、要到現場買。比羅夫官方 9/17 公告エース第 3 リフト由 2 人座改為 4 人座、速度約兩倍、附擋風罩，輸送量由每小時 1,029 人增至 2,400 人；觀光纜車與山頂餐廳 NEST813 無論積雪 11/28 都開。Niseko Village 的 8 人座「森のゴンドラ」第一段（到標高 670 公尺）預定 2026-27 雪季啟用、第二段 2027 年完成；Annupuri 纜車預定 2028-29 雪季整組更新。另外二世谷町住宿稅自 2026/11/1 起調整，Hilton 二世谷村的露天風呂目前整修暫停。',
    source: 'https://www.niseko.ne.jp/en/news/niseko-uniteds-lift-network-gets-a-major-boost/',
    sourceLabel: 'Niseko United 官方新聞',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'rusutsu',
    kind: 'price',
    title: '留壽都：札幌接駁巴士冬季改收費，單程 ¥3,000；開季期票價公布',
    summary:
      '冬季的札幌⇄留壽都巴士名為「ルスツエクスプレス」（9 月那則動態寫的「ルスツ号」是夏季的免費車，已更正），2026/11/28–2027/3/31 運行，線上預付單程 ¥3,000（大人小孩同價，4 歲以下抱著免費），前一日 15:00 前預約，車程 105 分鐘。票價頁新增開季期：初滑①（11/28–12/11）窗口限定 ¥7,900／¥4,100、初滑②（12/12–12/18）¥10,500／¥4,400、春滑（3/15–3/31）¥10,500／¥4,400；正規期（12/19–3/14）線上 ¥13,200、窗口 ¥16,700 不變。',
    source: 'https://rusutsu.com/access-shuttle-bus-sapporo/',
    sourceLabel: 'ルスツリゾート 官方接駁巴士頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'tomamu',
    kind: 'price',
    title: 'TOMAMU：開季期與春滑一日券 ¥5,000；官方首次列出各級雪道條數',
    summary:
      '票價頁新增アーリーシーズン（12/1–12/20）與春季（3/29–4/5）一日券大人 ¥5,000、兒童 ¥2,500；正規窗口價 ¥9,500／¥7,500、線上 ¥9,200／¥7,200、住客 ¥9,000／¥7,000 不變。官方雪道頁本季直接寫出「全 29 條：上級 4、中級 14、初級 10、初心 1」，與本站先前自行清點一致，卡片的來源等級由第三方改為官方。託兒服務 12/1–4/5、收滿 5 個月起，但本季頁面沒有再寫時段與預約期限；兒童團體課分 4–6 歲與 7–12 歲，私人課 4 歲起。',
    source: 'https://www.snowtomamu.jp/winter/ski/ticket/',
    sourceLabel: '星野リゾート トマム 官方リフト料金頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'karuizawa',
    kind: 'facility',
    title: '輕井澤王子：官方聲明不接受無許可的雪場教學，查獲會請離場',
    summary:
      '官方 10/29 公告：未經雪場許可、以營業為目的的滑雪或單板教學一律不接受，被認定為無許可教學者會被要求離場。對透過社群或旅行社找中文教練的人來說，請先確認對方是不是官方掛牌的雪校（官方繁中站列的中文課程是王子滑雪學校）。另外 10/31 已開季，目前 14 條雪道開 2 條（人工造雪）；票價頁新增「ハイトップシーズン」¥13,000（12/29–1/3、1/9–11、2/6–7、2/11–14、2/20–23），本站卡片已補上。',
    source: 'https://www.princehotels.co.jp/ski/karuizawa/informations/26resson',
    sourceLabel: '軽井沢プリンスホテルスキー場 官方公告',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'nozawa',
    kind: 'facility',
    title: '野澤溫泉：托兒所「ゆ～みん」資料改為官方版，11/16 起開放預約',
    summary:
      '本站卡片原本引用第三方資料，現已改為官網：日影資訊中心 2 樓，收 1–6 歲，2026/12/19–2027/3/28；上午 8:30–12:00、下午 13:00–16:15，中午不收托；一日 ¥7,000、半日 ¥4,000、每小時 ¥2,000。日文公告寫約 20 名、平日電話預約；英文頁寫 25 名、只接受線上表單，兩邊不一致，預約時請以實際回覆為準。雪場 11/28 開季、正規票期 12/19–3/28；上ノ平公園預定 12 月下旬開放。',
    source: 'https://en.nozawaski.com/the-mountain/mountain-facilities/childcare',
    sourceLabel: '野沢温泉スキー場 官方 Child Daycare 頁',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-23',
    resortId: 'niseko',
    kind: 'facility',
    title: '二世谷：兩處托兒的收托年齡與費用改為各自官網的 2026-27 版',
    summary:
      'Niseko United 官方 kids 頁已不再列托兒細節，改查各自官網：HANAZONO 的 Niseko Kids Club 日托收 12 個月～4 歲（保母服務收新生兒～15 歲），2026/12/8–2027/3/31，全日 ¥28,000（旺季 ¥31,000）、含午餐，全員會英語、部分會中文；Niseko Village Kids Club 收 1.5～9 歲、每日限 20 人，2026/12/1–2027/2/28，有英語與普通話教練，基本套餐價格要看官方 PDF。本站卡片已同步更新。',
    source: 'https://www.niseko-village.com/kids-club/',
    sourceLabel: 'Niseko Village 官方 Kids Club 頁',
    sourceLevel: 'official',
  },
  // ── 2026-11-16 ──────────────────────────────────────
  {
    date: '2026-11-16',
    resortId: null,
    kind: 'price',
    title: '10 座雪場的 2026-27 票價全部重新查證，4 座漲價',
    summary:
      '逐一打開 10 座雪場的官方票價頁重新核對。四座原本還掛著 2025-26 的價格，已更新為 2026-27：GALA 湯澤 ¥6,500→¥8,000、苗場 ¥7,800→¥9,800、富良野 ¥8,000→¥9,000、TOMAMU ¥8,000→¥9,500（窗口價）。白馬八方、志賀高原、野澤溫泉、二世谷、留壽都的票價查證後沒有變動。輕井澤的票價沒變，但原本註記寫的「最繁忙日 ¥13,000」有誤，官網的トップシーズン特定日是 ¥12,000，已更正。',
    source: 'https://www.princehotels.co.jp/ski/naeba/winter/lift/',
    sourceLabel: '各雪場官方票價頁（苗場為其中之一）',
    sourceLevel: 'official',
  },
  {
    date: '2026-11-16',
    resortId: 'shigakogen',
    kind: 'facility',
    title: '志賀高原官網改版，原本的票價網址已失效',
    summary:
      '原本引用的 shigakogen-ski.or.jp/winter/ticket/ 現在回 403，票價頁搬到 /ticket/index.html。本站引用的網址已更新。2026-27 共通券一日券大人 ¥9,500、兒童 ¥4,000，全 18 座雪場 45 條纜車通用，價格與先前查證一致。',
    source: 'https://shigakogen-ski.or.jp/ticket/index.html',
    sourceLabel: '志賀高原 官方 リフト券窓口販売料金',
    sourceLevel: 'official',
  },
];

/**
 * 最近一次「檢查」的日期（每週排程跑完就改成當天，就算沒有異動也要改）。
 * 頁面上的「上次查證」顯示這個，而不是最後一則更新的日期。
 */
export const LAST_CHECKED = '2026-11-23';
