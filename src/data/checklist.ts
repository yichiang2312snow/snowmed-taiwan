/**
 * 出發前注意事項互動檢核表的資料來源
 *
 * 分成三個階段：在台灣出發前 → 抵達雪場、滑行前 → 滑行期間。
 * 每一項都標了適用條件，前端會依照使用者選的「板種 / 程度 / 舊傷」篩出屬於他的清單。
 * 要新增或修改項目，只要改這個檔案。
 */

export type Board = 'ski' | 'snowboard' | 'both';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Injury = 'none' | 'knee' | 'shoulder' | 'back' | 'other';
export type Phase = 'home' | 'resort' | 'riding';

export interface ChecklistItem {
  /** 穩定的識別碼，用來記住勾選狀態 */
  id: string;
  label: string;
  /** 為什麼要做這件事 —— 讓使用者可以自己判斷要不要採納 */
  why?: string;
  boards?: Board[];
  levels?: Level[];
  injuries?: Injury[];
  /** 強烈建議的項目會標成重點 */
  critical?: boolean;
}

export interface ChecklistSection {
  id: string;
  phase: Phase;
  title: string;
  emoji: string;
  intro: string;
  items: ChecklistItem[];
}

export const PHASES: { id: Phase; title: string; subtitle: string; emoji: string }[] = [
  {
    id: 'home',
    title: '一、在台灣出發前',
    subtitle: '打包、身體準備、保險文件。這個階段做好，後面會輕鬆很多。',
    emoji: '🏠',
  },
  {
    id: 'resort',
    title: '二、抵達雪場、滑行前',
    subtitle: '租借、裝備設定與當地資訊。很多人跳過這一段，然後在雪道上才發現不對。',
    emoji: '🎿',
  },
  {
    id: 'riding',
    title: '三、滑行期間',
    subtitle: '當天的判斷與行為。體能再好，這一段做錯一樣會受傷。',
    emoji: '🏔️',
  },
];

export const CHECKLIST: ChecklistSection[] = [
  // ══════════ 一、在台灣出發前 ══════════
  {
    id: 'must-bring',
    phase: 'home',
    title: '一定要自己帶（租不到，或不適合租）',
    emoji: '🎒',
    intro: '這一區的東西在雪場通常租不到、或是貼身用品不適合租借，一定要從台灣帶去。',
    items: [
      {
        id: 'goggles',
        label: '護目鏡（雪鏡）',
        why: '雪場多半租不到，或只有品質很差的。高海拔紫外線強、雪地反射率高，沒有護目鏡除了看不清楚，還可能雪盲。建議另備一片晴天／陰天用的鏡片。',
        critical: true,
      },
      {
        id: 'gloves',
        label: '手套（防水、保暖）',
        why: '貼身用品，租借的衛生與合手度都不理想。手套濕掉又冷又難操作，建議帶兩副輪流。',
        critical: true,
      },
      {
        id: 'baselayer',
        label: '貼身衣物：排汗發熱衣褲、雪襪',
        why: '貼身層不適合租借。重點是「排汗」而不是「厚」—— 棉質內衣吸汗後不乾，會讓你整天又濕又冷。雪襪要及膝、不要穿兩雙。',
        critical: true,
      },
      {
        id: 'sunscreen',
        label: '防曬油（高係數）',
        why: '雪地的反光非常嚴重，紫外線從上下兩個方向照過來，加上高海拔，曬傷程度常被大幅低估。陰天也要擦，要補擦。',
        critical: true,
      },
      {
        id: 'lipbalm',
        label: '護唇膏（最好有防曬）',
        why: '雪場空氣非常乾燥，加上風吹與紫外線，嘴唇很快就會乾裂流血。這是最常被忘記、也最影響心情的小東西。',
        critical: true,
      },
      {
        id: 'neckwarmer',
        label: '脖圍或面罩',
        why: '擋風、保暖，也保護臉部不被曬傷。纜車上迎風那幾分鐘最需要它。',
      },
      {
        id: 'wrist',
        label: '護腕',
        why: '向後跌倒時反射性用手撐地，是單板手腕骨折最常見的機轉。護腕對初學到中階者有明確的保護效果，而且雪場不一定租得到。',
        boards: ['snowboard'],
        levels: ['beginner', 'intermediate'],
        critical: true,
      },
      {
        id: 'impact-shorts',
        label: '防摔褲 / 尾椎護具',
        why: '單板初學階段大量的後仰跌倒，尾椎和臀部是主要著地點。',
        boards: ['snowboard'],
        levels: ['beginner'],
      },
      {
        id: 'knee-brace',
        label: '功能性護膝（依醫師建議選擇型號）',
        why: '對受傷後回歸初期的本體感覺與心理安全感有幫助。它不能取代肌力，但能讓你更敢做出正確的動作。',
        injuries: ['knee'],
      },
      {
        id: 'shoulder-brace',
        label: '肩關節護具（曾脫臼者）',
        why: '復發性肩關節脫臼在跌倒撐地時風險很高，護具可限制危險角度。',
        injuries: ['shoulder'],
      },
    ],
  },
  {
    id: 'can-rent',
    phase: 'home',
    title: '這些可以到當地租，不用扛去',
    emoji: '💡',
    intro: '第一次去的人常常花大錢買了用不到幾次的裝備。以下這些在雪場租就好，先把錢省下來。',
    items: [
      {
        id: 'rent-outerwear',
        label: '最外層的雪衣、雪褲 —— 可以租',
        why: '幾乎所有雪場都租得到，而且行李箱馬上少一半。等你確定會持續滑，再買自己喜歡的。真正不能省的是裡面那層排汗衣。',
        critical: true,
      },
      {
        id: 'rent-helmet',
        label: '安全帽 —— 可以租',
        why: '雪場都有提供租借。租的時候務必試戴：扣好後左右搖頭不會晃動、額頭與帽緣之間塞不進兩根手指。不要因為嫌麻煩就不戴。',
        critical: true,
      },
      {
        id: 'rent-gear',
        label: '雪板／雪鞋／固定器 —— 可以租',
        why: '初學階段板子的差異遠小於技術的差異。租借還有一個好處：技師會幫你依體重身高設定固定器。',
        levels: ['beginner', 'intermediate'],
      },
      {
        id: 'book-instructor',
        label: '完全沒學過的話，先把教練預約好',
        why: '第一次上雪自己摸索，最常見的結果是用錯誤的姿勢練了三天、養成習慣，然後在第四天受傷。對初學者來說，教練不是加分項，是最重要的一項安全裝備 —— 它能同時縮短學習時間和降低受傷機率。旺季現場通常約不到，一定要出發前就訂好。',
        levels: ['beginner'],
        critical: true,
      },
      {
        id: 'rent-book',
        label: '旺季先線上預約租借與教練',
        why: '過年、寒假、週末現場排隊可能排掉一整個上午。教練更是要提前訂。',
      },
    ],
  },
  {
    id: 'body',
    phase: 'home',
    title: '身體準備',
    emoji: '💪',
    intro: '出發前兩個月能做的，比出發當天能做的多很多。',
    items: [
      {
        id: 'training',
        label: '完成行前體能訓練（至少 6–8 週）',
        why: '肌力訓練需要 6–8 週才會產生可測量的改變。臀肌與單側控制比大腿更值得投資。',
        critical: true,
      },
      {
        id: 'fitness-test',
        label: '做過一次體能自我檢測，知道自己最弱的環節',
      },
      {
        id: 'rehab-clear',
        label: '和你的醫師或治療師確認：目前的狀態可以滑雪',
        why: '舊傷的回歸判斷不該只看時間，而該看客觀的肌力對稱性與功能測試。',
        injuries: ['knee', 'shoulder', 'back', 'other'],
        critical: true,
      },
      {
        id: 'meds',
        label: '備妥常用藥物與止痛藥（含平常在吃的慢性病藥）',
        why: '海外取得處方藥的門檻高。隨身藥品要放手提行李，不要全部託運。',
      },
    ],
  },
  {
    id: 'insurance',
    phase: 'home',
    title: '保險與文件',
    emoji: '📄',
    intro: '這一區在沒事的時候完全用不到，出事的時候決定你損失多少。',
    items: [
      {
        id: 'travel-insurance',
        label: '確認旅平險的「海外突發疾病醫療」與「意外醫療」額度',
        why: '海外骨科手術與住院費用可能是六位數起跳，一般信用卡附贈的保險額度通常不足。',
        critical: true,
      },
      {
        id: 'winter-sports-rider',
        label: '確認保單有涵蓋滑雪 / 冬季運動（部分保單列為除外或需加購）',
        why: '滑雪在部分保單被歸類為高風險活動。沒有加購就理賠不到，這是最常見的踩坑點。',
        critical: true,
      },
      {
        id: 'evacuation',
        label: '確認是否涵蓋「緊急救援與後送」費用',
        why: '直升機後送與跨國醫療專機的費用極高，通常不在基本醫療額度內。',
      },
      {
        id: 'nhi-refund',
        label: '了解健保「自墊醫療費用核退」需要的文件',
        why: '回國後申請核退需要診斷書與費用收據正本，這些必須在當地就醫時就拿到。',
      },
      {
        id: 'passport-copy',
        label: '護照、保單號碼、緊急聯絡人存成手機離線檔案',
        why: '受傷當下手忙腳亂，而且雪場常常沒有訊號。',
      },
    ],
  },

  // ══════════ 二、抵達雪場、滑行前 ══════════
  {
    id: 'fitting',
    phase: 'resort',
    title: '租借與裝備設定',
    emoji: '🔧',
    intro: '裝備設定錯誤造成的傷害，全部都是可以避免的。這一段花十分鐘，比什麼都值得。',
    items: [
      {
        id: 'din',
        label: '請技師依體重、身高、鞋底長度與滑行程度設定固定器 DIN 值',
        why: 'DIN 設定過高，該脫的時候不脫，力量全部進到膝蓋；設定過低又會誤脫。這個數值不該自己憑感覺調。',
        boards: ['ski'],
        critical: true,
      },
      {
        id: 'binding-check',
        label: '確認固定器螺絲、底板與高背角度',
        why: '角度設定不合會讓膝蓋和踝關節長時間處於代償姿勢，容易累積性疼痛。租借時可以請店家協助調整。',
        boards: ['snowboard'],
      },
      {
        id: 'boot-fit',
        label: '試穿雪鞋：不壓迫、但腳跟不會上下滑動',
        why: '過鬆會讓控制力下降並造成代償受力；過緊則壓迫神經與血液循環。租借時一定要走幾步、蹲一下再決定。',
        critical: true,
      },
      {
        id: 'helmet-fit',
        label: '試戴安全帽：扣好後搖頭不晃、額頭塞不進兩指',
        why: '尺寸不合的安全帽在撞擊時會移位，保護效果大打折扣。',
        critical: true,
      },
      {
        id: 'goggle-fit',
        label: '確認護目鏡與安全帽之間沒有空隙',
        why: '額頭那條縫是最容易凍傷也最容易曬傷的位置。',
      },
    ],
  },
  {
    id: 'local-info',
    phase: 'resort',
    title: '當地資訊',
    emoji: '📍',
    intro: '這些資訊在需要的時候才去查就來不及了。買雪票的時候一併問清楚。',
    items: [
      {
        id: 'patrol-number',
        label: '把雪場巡邏隊的緊急電話存進手機',
        why: '購票或領取雪票時就可以問到。真的需要的時候，你不會有時間上網查。',
        critical: true,
      },
      {
        id: 'trail-map',
        label: '拿一份雪道圖，並下載離線地圖',
        why: '雪場常常沒有訊號，紙本地圖不會沒電。',
        critical: true,
      },
      {
        id: 'read-map',
        label: '確認你「看得懂」這張地圖',
        why: '不是拿到就好。要看得懂：顏色分級各代表什麼難度（各國定義不同）、你的程度可以走哪幾條、纜車編號怎麼對、以及最後下山的那條路線是哪一條。看不懂就在纜車站問工作人員，這不丟臉。',
        critical: true,
      },
      {
        id: 'patrol-location',
        label: '確認雪場巡邏隊（Ski Patrol）與救護站的位置',
        why: '知道最近的救護站在哪一個纜車站旁邊，受傷時可以直接指引同伴去找人，比打電話描述位置快得多。',
        critical: true,
      },
      {
        id: 'clinic-info',
        label: '確認最近的醫療院所在哪裡、是哪一科',
        why: '有些雪場當地只有內科診所，沒有整形外科，運動外傷要往外送、車程可能很遠。先知道，受傷時才不會慌。',
        critical: true,
      },
      {
        id: 'emergency-numbers',
        label: '把當地緊急電話存進手機（日本：119 救護、110 警察）',
        why: '存成聯絡人，不要只記在腦子裡。手套戴著、手在抖、又緊張的時候，翻聯絡人比回想號碼容易。',
        critical: true,
      },
      {
        id: 'meet-point',
        label: '和同伴約好集合點與失聯時的作法',
        why: '一個人在樹林區或視線死角受傷，被發現的時間可能很長。',
      },
      {
        id: 'lift-close',
        label: '確認纜車的營業時間與最後上山時間',
        why: '錯過最後一班纜車，可能要走很長的路下山，而那通常發生在最累、天最黑的時候。',
      },
    ],
  },

  // ══════════ 三、滑行期間 ══════════
  {
    id: 'riding',
    phase: 'riding',
    title: '滑行期間的原則',
    emoji: '⛷️',
    intro: '出發前先讀一次，到了雪場會自動想起來。讀完請打勾，表示你已經記住了。',
    items: [
      {
        id: 'warmup',
        label: '前 30 分鐘當作熱身，不要第一趟就衝難的線',
        why: '肌肉和判斷力都需要開機時間。',
        critical: true,
      },
      {
        id: 'afternoon',
        label: '下午提高警覺，累了就收，不要「再滑最後一趟」',
        why: '疲勞累積之後動作品質下降，而這正是很多傷害發生的時間點。',
        critical: true,
      },
      {
        id: 'no-alcohol',
        label: '不喝酒上山',
        why: '酒精同時影響判斷、平衡與體溫調節。',
        critical: true,
      },
      {
        id: 'fall-technique',
        label: '練習安全跌倒：收下巴、不要伸直手臂撐地、順勢滾',
        why: '伸直手臂撐地是手腕骨折與肩關節受傷的主要機轉之一。',
        levels: ['beginner'],
        critical: true,
      },
      {
        id: 'weather-watch',
        label: '隨時看天氣：風雪要來就提早下山',
        why: '山上的天氣變化很快。能見度一旦掉下來，找路、判斷坡度、看到別人都會變得困難，而且體溫流失得非常快。不要賭「應該還可以再滑一趟」—— 提早下山的代價只是少滑幾趟。',
        critical: true,
      },
      {
        id: 'lift-early-close',
        label: '注意纜車可能因強風或雪況提早關閉',
        why: '很多纜車會依當天狀況臨時停駛，而且往往是最高處那幾條先停。如果你人在山上、回程要靠那條纜車，就會變成得走很長的路下山。上山前先確認回程路線，滑行中也要留意廣播與告示。',
        critical: true,
      },
      {
        id: 'no-backcountry',
        label: '不要自己進野雪區（off-piste／backcountry）',
        why: '壓雪道以外的區域沒有巡邏、沒有壓雪、也沒有人會注意到你不見了。真正的風險是雪崩、樹坑（tree well，掉進樹根周圍的鬆雪裡很難自己爬出來）與失溫。而且一旦出事，是當地的救難人員冒著同樣的風險進去找你 —— 每年都有台灣雪友因此需要日方大規模搜救。想滑野雪，請找有證照的嚮導、帶齊雪崩裝備、並且結伴同行。',
        critical: true,
      },
      {
        id: 'terrain',
        label: '天氣差、能見度低、雪況硬冰時，主動降級難度',
        why: '雪況比你的技術更容易改變當天的風險。',
      },
      {
        id: 'sunscreen-reapply',
        label: '中午補擦防曬與護唇膏',
        why: '流汗與擦拭會把防曬帶走。雪地一天下來的紫外線劑量，比你想的多很多。',
      },
      {
        id: 'hydration',
        label: '補水與補充熱量，不要整天只喝一瓶水',
        why: '低溫會抑制口渴感，但高海拔與乾燥空氣讓你流失得更快。脫水會直接讓判斷力下降。',
      },
      {
        id: 'head-hit',
        label: '只要撞到頭，當天就不要再上山',
        why: '腦震盪不一定會昏迷，症狀可能延遲數小時才出現。而還沒恢復時再撞一次，後果可能是不可逆的。',
        critical: true,
      },
    ],
  },
];
