/**
 * 日本主要雪場區域的概要資料
 *
 * ⚠️ 維護規則
 * 這裡只放「相對穩定、不太會變」的性格描述（雪質傾向、地形特性、交通門戶、適合對象），
 * 不放纜車數量、雪道條數、票價、營業日期這類每年都會變的數字 —— 那些一律請使用者看官網。
 * 交通時間是概略值，頁面上會標明「請以官方資訊為準」。
 */

export type Gateway = 'hokkaido' | 'tokyo';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Priority = 'powder' | 'language' | 'family' | 'onsen' | 'value' | 'short';

export interface Resort {
  id: string;
  name: string;
  nameJa: string;
  prefecture: string;
  gateway: Gateway;
  /** 進出的主要機場或車站 */
  access: string;
  /** 這個雪場最適合誰 */
  levels: Level[];
  priorities: Priority[];
  why: string;
  caution?: string;
  officialUrl: string;
  /** 對應 /emergency 頁面上的醫療資訊區塊 id */
  medicalAnchor?: string;
}

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

export const RESORTS: Resort[] = [
  {
    id: 'niseko',
    name: '二世谷',
    nameJa: 'ニセコ',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士約 2.5–3 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['powder', 'language'],
    why: '日本最國際化的雪場區域，以乾燥粉雪聞名。中英文標示、教練與餐飲選擇最完整，對第一次自己安排行程的人負擔最小。醫療端也有中英文診所。',
    caution: '住宿與餐飲費用在日本雪場中偏高，旺季需要很早訂房。',
    officialUrl: 'https://www.niseko.ne.jp/',
    medicalAnchor: 'niseko',
  },
  {
    id: 'rusutsu',
    name: '留壽都',
    nameJa: 'ルスツ',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士約 1.5–2 小時',
    levels: ['intermediate', 'advanced'],
    priorities: ['powder'],
    why: '雪質與二世谷同屬一個山系，樹林地形是最大特色，人潮相對少一些。度假村型態，吃住滑都在同一區內。',
    caution: '樹林區對中階以下有難度，第一次去建議先待在整理過的雪道上。',
    officialUrl: 'https://rusutsu.com/',
  },
  {
    id: 'furano',
    name: '富良野',
    nameJa: '富良野',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '旭川機場搭巴士約 1 小時',
    levels: ['beginner', 'intermediate'],
    priorities: ['powder', 'value', 'family'],
    why: '雪質好、雪道整理得很整齊、人潮比二世谷少，價格也親切一些。對想好好練基本功的人是很舒服的選擇。',
    officialUrl: 'https://www.princehotels.co.jp/ski/furano/',
  },
  {
    id: 'tomamu',
    name: '星野度假村 TOMAMU',
    nameJa: '星野リゾート トマム',
    prefecture: '北海道',
    gateway: 'hokkaido',
    access: '新千歲機場搭巴士或鐵路約 1.5–2 小時',
    levels: ['beginner', 'intermediate'],
    priorities: ['family', 'onsen'],
    why: '典型的一站式度假村：住宿、室內水上樂園、溫泉、餐廳都在園區內，帶小孩或長輩時移動負擔最小。',
    caution:
      '⚠️ 當地的村立診療所只有內科與小兒科，沒有整形外科。骨折、韌帶等運動傷害需要往富良野方向後送，車程不短 —— 在這裡受傷時不要想著「撐到隔天再說」。',
    officialUrl: 'https://www.snowtomamu.jp/winter/',
    medicalAnchor: 'tomamu',
  },
  {
    id: 'hakuba',
    name: '白馬',
    nameJa: '白馬',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線＋巴士約 3.5–4.5 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['language', 'onsen'],
    why: '由多個雪場組成，地形從緩坡到陡峭大斜面都有，一張通票可以跑好幾個場地，適合停留多天。是本州少數有全英語診所的區域，語言負擔低。',
    officialUrl: 'https://www.hakubavalley.com/',
    medicalAnchor: 'hakuba',
  },
  {
    id: 'shigakogen',
    name: '志賀高原',
    nameJa: '志賀高原',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線＋巴士約 3–4 小時',
    levels: ['beginner', 'intermediate', 'advanced'],
    priorities: ['onsen', 'value'],
    why: '日本規模最大的雪場群之一，海拔高、雪況穩定，一張票可以連通多個區域。適合想要「滑不完」的人。',
    caution: '區域很大且分散，第一次去容易迷路，建議先查好纜車路線圖。',
    officialUrl: 'https://shigakogen-ski.or.jp/',
  },
  {
    id: 'nozawa',
    name: '野澤溫泉',
    nameJa: '野沢温泉',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線＋巴士約 2.5–3.5 小時',
    levels: ['intermediate', 'advanced'],
    priorities: ['onsen', 'powder'],
    why: '雪場加上老溫泉街，滑完可以直接走進village泡外湯。日式風情濃，是很多人心中「日本滑雪」的原型。',
    caution: '雪道坡度變化大，初學者的活動範圍相對有限。',
    officialUrl: 'https://nozawaski.com/',
  },
  {
    id: 'gala',
    name: 'GALA 湯澤',
    nameJa: 'GALA湯沢',
    prefecture: '新潟',
    gateway: 'tokyo',
    access: '東京搭上越新幹線約 75 分鐘，車站直通雪場',
    levels: ['beginner', 'intermediate'],
    priorities: ['short', 'value', 'family'],
    why: '新幹線車站直接連到纜車站，不用轉車也不用搬雪具。行程只有兩三天、或想安排一日滑雪的人，交通效率無人能敵。',
    caution: '海拔較低，季末雪況變化較快。規模不大，滑三天以上可能會覺得不夠。',
    officialUrl: 'https://gala.co.jp/',
    medicalAnchor: 'yuzawa',
  },
  {
    id: 'naeba',
    name: '苗場',
    nameJa: '苗場',
    prefecture: '新潟',
    gateway: 'tokyo',
    access: '東京搭新幹線＋巴士約 2–2.5 小時',
    levels: ['beginner', 'intermediate'],
    priorities: ['family', 'short', 'onsen'],
    why: '飯店就在雪道旁，設施完整、教學系統成熟，親子與初學者的配套很齊全。可以搭纜車連通到隔壁的神樂雪場。',
    officialUrl: 'https://www.princehotels.co.jp/ski/naeba/',
    medicalAnchor: 'yuzawa',
  },
  {
    id: 'karuizawa',
    name: '輕井澤王子',
    nameJa: '軽井沢プリンス',
    prefecture: '長野',
    gateway: 'tokyo',
    access: '東京搭新幹線約 70 分鐘，車站旁接駁',
    levels: ['beginner'],
    priorities: ['short', 'family', 'value'],
    why: '交通極方便、坡度平緩、以人工造雪為主所以雪況穩定，是台灣人最常選的「第一次上雪」地點。旁邊就是 outlet，不滑雪的同行者也不會無聊。',
    caution: '雪道以緩坡為主，中階以上很快會覺得不夠玩。晴天多但雪質不是粉雪。',
    officialUrl: 'https://www.princehotels.co.jp/ski/karuizawa/',
  },
];
