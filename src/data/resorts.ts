/**
 * 海外雪場醫療資訊
 *
 * ⚠️ 維護規則（很重要）
 * 這個檔案裡的地址與電話，每一筆都必須附上 `source` 官方來源連結和 `checkedAt` 查證日期。
 * 不確定的資訊寧可不要放，也不要寫個大概 —— 使用者可能在受傷、著急、語言不通的狀況下依賴它。
 *
 * 雪季門診時間、臨時診療所的開設期間每年都會變動，頁面上務必提醒使用者出發前自行再確認。
 */

export interface Facility {
  name: string;
  nameEn?: string;
  /** clinic = 診所／臨時雪場診療所；hospital = 綜合醫院（有住院與手術能力） */
  type: 'clinic' | 'hospital';
  address: string;
  phone: string;
  departments: string;
  hours?: string;
  /** 語言支援，沒有確認到就留空，不要猜 */
  languages?: string;
  note?: string;
  /** 官方或權威來源 */
  source: string;
  sourceLabel: string;
  checkedAt: string;
}

export interface Resort {
  id: string;
  /** 中文慣用名 */
  name: string;
  nameJa: string;
  country: '日本';
  area: string;
  /** 這個區域涵蓋哪些雪場 */
  resorts: string[];
  /** 給使用者的區域性提醒 */
  note: string;
  facilities: Facility[];
}

export const EMERGENCY_NUMBER = {
  japan: {
    number: '119',
    label: '消防・救急（叫救護車）',
    note: '日本的救護車本身免費，但後續的診察、檢查與治療費用要自付（再向保險申請）。打通後先說「救急車をお願いします（kyūkyūsha o onegai shimasu）」，再講地點。',
  },
  japanPolice: {
    number: '110',
    label: '警察',
    note: '涉及他人碰撞、需要事故紀錄時使用。要申請保險理賠的碰撞事故，建議留下紀錄。',
  },
} as const;

export const RESORTS: Resort[] = [
  {
    id: 'yuzawa',
    name: '湯澤',
    nameJa: '湯沢',
    country: '日本',
    area: '新潟県 南魚沼郡 湯沢町',
    resorts: ['GALA湯澤', '苗場', '神樂／三俁', '岩原', '湯澤高原', '舞子'],
    note: '從東京搭上越新幹線約 75 分鐘就到越後湯澤站，是台灣人最常去的區域之一。町內有公立的綜合醫療中心，但外語支援不一定隨時都有，建議請飯店或雪場服務台協助聯繫。',
    facilities: [
      {
        name: '湯澤町保健醫療中心',
        nameEn: 'Yuzawa Community Medical Center（湯沢町保健医療センター）',
        type: 'hospital',
        address: '〒949-6101 新潟県南魚沼郡湯沢町大字湯沢2877-1',
        phone: '025-780-6543',
        departments: '總合診療科、外科、整形外科、小兒科、眼科、齒科',
        hours: '平日 8:30–11:30 / 13:30–16:30（電話受理時間）',
        note: '町內規模最大、設有整形外科的醫療機構。越後湯澤站附近，從主要雪場都可抵達。',
        source: 'https://yuzawa.jadecom.or.jp/',
        sourceLabel: '湯沢町保健医療センター 官方網站',
        checkedAt: '2026-09-12',
      },
    ],
  },
  {
    id: 'hakuba',
    name: '白馬',
    nameJa: '白馬',
    country: '日本',
    area: '長野県 北安曇郡 白馬村',
    resorts: ['八方尾根', '白馬五龍', '47', '栂池高原', '岩岳'],
    note: '白馬是日本少數有「全英語對應診所」的雪場區域，對台灣雪友來說語言負擔小很多。冬季有專門承接雪場外傷的診療機制。',
    facilities: [
      {
        name: '白馬國際診所',
        nameEn: 'Hakuba International Clinic（白馬インターナショナルクリニック）',
        type: 'clinic',
        address: '〒399-9301 長野県北安曇郡白馬村北城3020-1393',
        phone: '0261-85-2264',
        departments: '內科、外科（旅行者診療、滑雪／單板外傷）',
        hours: '週一–週六 10:00–17:00（國定假日休診）',
        languages: '全體職員可英語溝通',
        note: '專門服務外國旅客，並可開立保險理賠需要的英文診斷書。對不會日文的台灣雪友是首選。',
        source: 'https://hic-med.com/en/home-en/',
        sourceLabel: 'Hakuba International Clinic 官方網站',
        checkedAt: '2026-09-12',
      },
      {
        name: 'Shintani 診所',
        nameEn: 'Shintani Clinic（しんたにクリニック）',
        type: 'clinic',
        address: '〒399-9211 長野県北安曇郡白馬村神城24195-56',
        phone: '0261-75-4177',
        departments: '內科、外科、整形外科、復健科',
        hours: '冬季 週二・三・五 8:30–12:00 / 13:30–17:30；週六 8:30–12:00 / 13:00–17:00；週日・假日 13:00–17:00',
        note: '12 月至隔年 4 月中旬承接白馬山麓的雪場外傷診療，與當地雪場合作。週日與假日有下午診，這在雪場區域很重要。',
        source: 'https://dr-shintani.com/',
        sourceLabel: 'しんたにクリニック 官方網站',
        checkedAt: '2026-09-12',
      },
      {
        name: '北阿爾卑斯醫療中心 白馬診療所',
        nameEn: 'Hakuba Clinic（北アルプス医療センター 白馬診療所）',
        type: 'clinic',
        address: '〒399-9211 長野県北安曇郡白馬村大字神城21551',
        phone: '0261-75-4123',
        departments: '內科、外科、整形外科、放射線科、復健科、透析',
        hours: '平日 8:30–11:30 / 13:00–16:30；看診日的週六 8:30–11:00（週日、國定假日、第 2・4・5 週六休診）',
        note: '公立體系診療所，有放射線科可拍 X 光。另可安排旅客的臨時透析。',
        source: 'https://www.azumi-ghp.jp/related/hakuba/',
        sourceLabel: '北アルプス医療センター あづみ病院 官方網站',
        checkedAt: '2026-09-12',
      },
    ],
  },
  {
    id: 'niseko',
    name: '二世谷',
    nameJa: 'ニセコ',
    country: '日本',
    area: '北海道 虻田郡 倶知安町・ニセコ町',
    resorts: ['Grand HIRAFU', 'HANAZONO', 'NISEKO Village', 'ANNUPURI'],
    note: '國際化程度最高的日本雪場區域，醫療端的外語支援相對完整。輕傷可先找國際診所，重傷或需要手術住院則送倶知安厚生病院。',
    facilities: [
      {
        name: '二世谷國際診所',
        nameEn: 'Niseko International Clinic（ニセコインターナショナルクリニック）',
        type: 'clinic',
        address: '〒044-0086 北海道虻田郡倶知安町ニセコひらふ5条3丁目7-1',
        phone: '0136-21-5454',
        departments: '旅行者診療、滑雪／單板外傷',
        languages: '英語、中文（常駐）',
        note: '每個雪季診治超過六千名外國旅客，可開立保險理賠用的英文診斷書。位置就在比羅夫（ひらふ）雪場區。',
        source: 'https://www.niseko-nic.com/en/',
        sourceLabel: 'Niseko International Clinic 官方網站',
        checkedAt: '2026-09-12',
      },
      {
        name: '倶知安厚生醫院',
        nameEn: 'Kutchan Kosei General Hospital（ニセコ羊蹄広域 倶知安厚生病院）',
        type: 'hospital',
        address: '〒044-0004 北海道虻田郡倶知安町北4条東1丁目2番地',
        phone: '0136-22-1141',
        departments: '整形外科、外科、腦神經外科、心臟血管外科、麻醉科等 17 科',
        note: '二世谷地區的核心醫院，負責羊蹄山麓七町村的急診與專科醫療，具備住院與手術能力。骨折、韌帶斷裂、頭部外傷等需要進一步處置的狀況會送到這裡。',
        source: 'https://www.dou-kouseiren.com/byouin/kutchan/about/index.html',
        sourceLabel: 'JA北海道厚生連 倶知安厚生病院 官方網站',
        checkedAt: '2026-09-12',
      },
    ],
  },
  {
    id: 'tomamu',
    name: '星野度假村 TOMAMU',
    nameJa: '星野リゾート トマム',
    country: '日本',
    area: '北海道 勇払郡 占冠村',
    resorts: ['星野リゾート トマム スキー場'],
    note: '⚠️ 這一區要特別注意：占冠村當地的診療所只有內科與小兒科，沒有整形外科。骨折、韌帶等運動傷害需要往富良野或更遠的醫院送，車程不短。這代表在 TOMAMU 受傷時，不要嘗試「撐到隔天再說」，該叫巡邏隊就叫。',
    facilities: [
      {
        name: '占冠村立 TOMAMU 診療所',
        nameEn: 'Shimukappu Village Tomamu Clinic（占冠村立トマム診療所）',
        type: 'clinic',
        address: '北海道勇払郡占冠村字上トマム2416',
        phone: '0167-57-2024',
        departments: '內科、小兒科（無整形外科、無病床）',
        note: '距離度假村最近的醫療機構，但沒有整形外科也沒有住院設施。運動外傷需要轉診。',
        source: 'https://jmap.jp/facilities/detail/555745',
        sourceLabel: '地域医療情報システム（日本医師会 JMAP）',
        checkedAt: '2026-09-12',
      },
      {
        name: '富良野協會醫院',
        nameEn: 'Furano Hospital（北海道社会事業協会 富良野病院）',
        type: 'hospital',
        address: '〒076-8765 北海道富良野市住吉町1番30号',
        phone: '0167-23-2181',
        departments: '整形外科、外科、內科等',
        note: '富良野地區負責夜間與例假日急診的醫院，是 TOMAMU 一帶運動外傷的主要後送目的地。前往前建議先致電確認。',
        source: 'https://ssl.hokushakyo.jp/furano-hospital/',
        sourceLabel: '社会福祉法人 北海道社会事業協会 富良野病院 官方網站',
        checkedAt: '2026-09-12',
      },
    ],
  },
];
