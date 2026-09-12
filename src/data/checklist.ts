/**
 * 出發前注意事項互動檢核表的資料來源
 *
 * 每一項都標了適用條件，前端會依照使用者選的「板種 / 程度 / 舊傷 / 目的地」
 * 篩出屬於他的清單。要新增或修改項目，只要改這個檔案。
 */

export type Board = 'ski' | 'snowboard' | 'both';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Injury = 'none' | 'knee' | 'shoulder' | 'back' | 'other';

export interface ChecklistItem {
  /** 穩定的識別碼，用來記住勾選狀態 */
  id: string;
  label: string;
  /** 為什麼要做這件事 —— 讓使用者可以自己判斷要不要採納 */
  why?: string;
  /** 只有這些板種才顯示；省略代表全部 */
  boards?: Board[];
  /** 只有這些程度才顯示；省略代表全部 */
  levels?: Level[];
  /** 只有這些舊傷才顯示；省略代表全部 */
  injuries?: Injury[];
  /** 強烈建議的項目會標成重點 */
  critical?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  emoji: string;
  intro: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistSection[] = [
  {
    id: 'protection',
    title: '防護裝備',
    emoji: '🪖',
    intro: '這一區的東西不是「有帶比較好」，是「沒帶就不該上山」。',
    items: [
      {
        id: 'helmet',
        label: '安全帽（確認沒有摔過、內襯完整）',
        why: '頭部外傷是雪地運動最嚴重的傷害來源。安全帽受過一次明顯撞擊後，保護結構可能已經失效，應該更換。',
        critical: true,
      },
      {
        id: 'goggles',
        label: '護目鏡（含備用鏡片或變色片）',
        why: '高海拔紫外線強、雪地反射率高，雪盲是真的會發生的事。能見度差時換淺色鏡片能顯著改善判斷。',
        critical: true,
      },
      {
        id: 'wrist',
        label: '護腕',
        why: '向後跌倒時反射性用手撐地，是單板手腕骨折最常見的機轉。護腕對初學到中階者有明確的保護效果。',
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
        id: 'back-protector',
        label: '護脊',
        why: '進入公園跳台、樹林區或高速滑行時，背部的直接撞擊風險上升。',
        levels: ['intermediate', 'advanced'],
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
    id: 'gear',
    title: '雪具設定',
    emoji: '🎿',
    intro: '裝備設定錯誤造成的傷害，全部都是可以避免的。',
    items: [
      {
        id: 'din',
        label: '請專業技師依體重、身高、鞋底長度與滑行程度設定固定器 DIN 值',
        why: 'DIN 設定過高，該脫的時候不脫，力量全部進到膝蓋；設定過低又會誤脫。這個數值不該自己憑感覺調。',
        boards: ['ski'],
        critical: true,
      },
      {
        id: 'binding-check',
        label: '確認固定器螺絲、底板與高背角度（單板）',
        why: '角度設定不合會讓膝蓋和踝關節長時間處於代償姿勢，容易累積性疼痛。',
        boards: ['snowboard'],
      },
      {
        id: 'boot-fit',
        label: '確認雪鞋合腳：不壓迫、但腳跟不會上下滑動',
        why: '過鬆會讓控制力下降並造成代償受力；過緊則壓迫神經與血液循環。值得花一次錢做專業選靴。',
        critical: true,
      },
      {
        id: 'edge-wax',
        label: '雪板整理：磨邊、打蠟',
        why: '刃鈍會在硬雪面上抓不住，這是初學者「突然滑掉」的常見原因之一。',
        levels: ['intermediate', 'advanced'],
      },
      {
        id: 'leash',
        label: '確認雪杖腕帶的使用方式',
        why: '樹林區、深雪或高速時，腕帶會讓雪杖在跌倒時無法脫手，反而增加拇指與肩膀受傷的風險。不少教練建議這些地形不穿腕帶。',
        boards: ['ski'],
      },
    ],
  },
  {
    id: 'body',
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
        why: '海外取得處方藥的門檻高。另外，隨身藥品要放手提行李，不要全部託運。',
      },
      {
        id: 'sunscreen',
        label: '高係數防曬（含唇部）',
        why: '雪地反射加上高海拔，曬傷程度常被低估。',
      },
      {
        id: 'altitude',
        label: '了解高海拔對身體的影響，抵達第一天不要滿檔',
        why: '高海拔會影響判斷力與耐力，前一兩天的適應期能減少疲勞造成的失誤。',
      },
    ],
  },
  {
    id: 'insurance',
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
        label: '確認保單有涵蓋滑雪 / 冬季運動（部分保單將其列為除外或需加購）',
        why: '滑雪在部分保單被歸類為高風險活動。沒有加購就理賠不到，這是最常見的踩坑點。',
        critical: true,
      },
      {
        id: 'evacuation',
        label: '確認是否涵蓋「緊急救援與後送」費用',
        why: '直升機後送與跨國醫療專機的費用極高，而且通常不在基本醫療額度內。',
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
      {
        id: 'patrol-number',
        label: '把雪場巡邏隊的緊急電話存進手機',
        why: '購票或領取雪票時就可以問到。真的需要的時候，你不會有時間上網查。',
        critical: true,
      },
    ],
  },
  {
    id: 'onsite',
    title: '雪場上的原則',
    emoji: '🏔️',
    intro: '出發前先讀一次，到了雪場會自動想起來。',
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
        id: 'buddy',
        label: '和同伴約好集合點與失聯時的作法',
        why: '一個人在樹林區或視線死角受傷，被發現的時間可能很長。',
      },
      {
        id: 'fall-technique',
        label: '練習安全跌倒：收下巴、不要伸直手臂撐地、順勢滾',
        why: '伸直手臂撐地是手腕骨折與肩關節受傷的主要機轉之一。',
        levels: ['beginner'],
        critical: true,
      },
      {
        id: 'terrain',
        label: '天氣差、能見度低、雪況硬冰時，主動降級難度',
        why: '雪況比你的技術更容易改變當天的風險。',
      },
    ],
  },
];
