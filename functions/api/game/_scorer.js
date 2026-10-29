/**
 * AI 評審：把一回合所有組別的政策一次送給 Claude，拿回每一組的加減分與解釋。
 *
 * 一次評完整回合（而不是一組一組評），是為了讓同一題的各組之間有相對公平的比較基準。
 *
 * 需要在 Cloudflare Pages 專案設定 Secret：ANTHROPIC_API_KEY
 *   npx wrangler pages secret put ANTHROPIC_API_KEY --project-name snowmed-taiwan
 * 本機測試沒有金鑰時，可以在 .dev.vars 設 GAME_MOCK_AI=1，用假的評分跑流程。
 */

import Anthropic from '@anthropic-ai/sdk';
import { RESOURCES, RESOURCE_KEYS, AI_MAX_DELTA, MAX_POLICY_CHARS, clamp } from './_lib.js';

const MODEL = 'claude-opus-5-5';

const resourceList = RESOURCES.map((r) => `${r.key}＝${r.label}`).join('、');

const SYSTEM = `你是「台灣醫療決策者體驗」桌遊的評審。玩家是大學一年級學生與對台灣醫療有興趣的一般聽眾，每一組扮演台灣的醫療政策決策者（政府、衛福部長、行政人員等）。

遊戲有五種資源，每種 0～100 分：${resourceList}。
每回合系統抽出一張事件卡，各組在 ${MAX_POLICY_CHARS} 字內寫下他們的政策。你要替每一組決定五種資源各加減多少分（每項介於 -${AI_MAX_DELTA} 到 +${AI_MAX_DELTA}），並用繁體中文（台灣用語）解釋。

評分原則：
1. 以台灣真實歷史事件的因果為依據（會提供原型事件與評分提示），政策越接近「事後證明有效」的作法，整體越正面。評分提示裡若有「創作者給的基準」，同類型的政策要對齊那個基準。
2. 這個遊戲的核心訊息是「醫療政策要同時考量多方因素」。只顧單一面向的極端政策，在它優先的那一項可以加分，但其他項要明顯扣分；有配套、兼顧多方的政策，各項加分或只小扣，整體最平衡。
3. 加減分要有區辨度：各組政策不同，結果就應該不同。同一回合各組之間要互相比較、保持公平；內容幾乎相同的政策應該得到幾乎相同的分數。
4. 預算與金額：每張卡有「預算換算」（1 分等於多少億元）。政策若寫明要花多少錢，就照換算扣預算（四捨五入，最多扣 ${AI_MAX_DELTA}）；寫明每年多收多少錢（保費、稅收）就照換算加預算。每一組會附上「目前預算」與「本回合支出上限」：支出不能超過上限；若政策的花費超過目前預算，預算扣到上限即可，但其他資源的加分要減半，並在解釋裡指出「超支」。沒寫金額但顯然要花錢的政策，依評分提示的預設金額估算。
5. 「無關、亂答、空泛（例如只寫『加油』、『再研究』、與題目無關的內容）」一律把 irrelevant 設為 true；系統會自動套用「政府無能」的懲罰，你不必自己給分，但仍要寫一句解釋。
6. 解釋 80～150 字，說清楚「為什麼加、為什麼扣」，語氣像老師講評：直接、具體、帶一點提醒。要讓學生看完知道自己漏掉了什麼面向。不要提到「原型事件」或真實事件名稱（歷史典故會由系統另外揭曉）。
7. roundSummary 用 2～3 句話比較這一回合各組的取向差異，供主持人帶討論。

請嚴格依照指定的 JSON 格式回答，teamId 要和輸入完全一致。`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          teamId: { type: 'string' },
          irrelevant: { type: 'boolean' },
          deltas: {
            type: 'object',
            properties: Object.fromEntries(RESOURCE_KEYS.map((k) => [k, { type: 'number' }])),
            required: RESOURCE_KEYS,
            additionalProperties: false,
          },
          explanation: { type: 'string' },
        },
        required: ['teamId', 'irrelevant', 'deltas', 'explanation'],
        additionalProperties: false,
      },
    },
    roundSummary: { type: 'string' },
  },
  required: ['results', 'roundSummary'],
  additionalProperties: false,
};

function buildUserPrompt({ round, card, entries }) {
  const answers = entries
    .map((e, i) => {
      const cap = e.budgetCap !== null && e.budgetCap !== undefined ? `${e.budgetCap} 分（選票低於 30，失去執政正當性）` : `${e.budget} 分（全部預算）`;
      return `【第 ${i + 1} 組】teamId: ${e.teamId}\n組名：${e.name}\n目前預算：${e.budget} 分（約 ${e.budget * card.budgetUnit} 億元）\n本回合支出上限：${cap}\n政策：${e.text}`;
    })
    .join('\n\n');

  return `# 第 ${round} 回合事件卡：${card.emoji} ${card.title}

## 各組看到的情境
${card.scenario}

## 預算換算
本題 1 分 = ${card.budgetUnit} 億元（例如花 ${10 * card.budgetUnit} 億 → 預算 -10；每年多收 ${5 * card.budgetUnit} 億 → 預算 +5）。

## 畫面上給各組的三個參考方向
${card.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}
（照抄參考方向、沒有補充自己的配套或細節的政策，給中等分數即可：方向對但不完整。）

## 原型事件（只給你參考，不要在解釋裡提到）
${card.reference.title}
${card.reference.bullets.map((b) => `- ${b}`).join('\n')}

## 評分提示
${card.judgeNotes}

## 各組的政策
${answers}

請為以上每一組評分。`;
}

/** 本機測試用：沒有 API 金鑰也能跑完整個流程 */
function mockScore(entries) {
  const hash = (s) => Array.from(s).reduce((h, ch) => (h * 31 + ch.codePointAt(0)) % 100003, 7);
  return {
    results: entries.map((e) => {
      const h = hash(e.text + e.teamId);
      const deltas = Object.fromEntries(RESOURCE_KEYS.map((k, i) => [k, ((h >> (i * 3)) % 21) - 10]));
      return {
        teamId: e.teamId,
        irrelevant: e.text.length < 4,
        deltas,
        explanation: `（測試模式，未使用 AI）這是依照文字內容產生的假分數，用來檢查遊戲流程。政策內容：「${e.text}」。`,
      };
    }),
    roundSummary: '（測試模式）各組取向比較的摘要會在正式評分時由 AI 產生。',
  };
}

function extractJson(message) {
  if (message.stop_reason === 'refusal') {
    throw new Error('AI 拒絕評分這一回合，請改用手動評分或再試一次');
  }
  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return JSON.parse(text);
}

/**
 * @param {object} env  Cloudflare env（需要 ANTHROPIC_API_KEY 或 GAME_MOCK_AI）
 * @param {{round:number, card:object, entries:{teamId:string,name:string,text:string}[]}} input
 * @returns {Promise<{results: Map<string, {deltas:object, explanation:string, irrelevant:boolean}>, summary: string}>}
 */
export async function scoreRound(env, input) {
  let raw;
  if (env.GAME_MOCK_AI === '1') {
    raw = mockScore(input.entries);
  } else {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('尚未設定 ANTHROPIC_API_KEY，無法使用 AI 評分（可先用手動評分）');
    }
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 170_000 });
    const request = {
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
      output_config: { effort: 'high', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    };
    let message;
    try {
      // 預設開啟伺服器端的拒答備援：萬一安全分類器誤判，自動改用備援模型完成同一個請求
      message = await client.beta.messages.create({
        ...request,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
    } catch (err) {
      // 備援參數若在這個環境不被接受，退回一般請求再試一次；其他錯誤原樣往上丟
      if (err instanceof Anthropic.BadRequestError) {
        message = await client.messages.create(request);
      } else {
        throw err;
      }
    }
    raw = extractJson(message);
  }

  const results = new Map();
  for (const r of raw.results ?? []) {
    if (!r || typeof r.teamId !== 'string') continue;
    results.set(r.teamId, {
      deltas: Object.fromEntries(RESOURCE_KEYS.map((k) => { const n = Math.round(Number(r.deltas?.[k] ?? 0)); return [k, Number.isFinite(n) ? clamp(n, -AI_MAX_DELTA, AI_MAX_DELTA) : 0]; })),
      explanation: String(r.explanation ?? '').trim(),
      irrelevant: r.irrelevant === true,
    });
  }
  const missing = input.entries.filter((e) => !results.has(e.teamId));
  if (missing.length) {
    throw new Error(`AI 漏評了 ${missing.map((m) => m.name).join('、')}，請再評一次`);
  }
  return { results, summary: String(raw.roundSummary ?? '').trim() };
}
