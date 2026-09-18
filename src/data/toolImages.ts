import type { ImageMetadata } from 'astro';

import fitnessCheck from '../assets/tools/tool-fitness-check.jpg';
import trainingPlan from '../assets/tools/tool-training-plan.jpg';
import injuryTriage from '../assets/tools/tool-injury-triage.jpg';
import returnToSnow from '../assets/tools/tool-return-to-snow.jpg';
import preTripChecklist from '../assets/tools/tool-pre-trip-checklist.jpg';
import xrayCheck from '../assets/tools/tool-xray-check.jpg';
import japanResorts from '../assets/tools/tool-japan-resorts.jpg';
import concussion from '../assets/tools/tool-concussion.jpg';
import taiwanIndoorSki from '../assets/tools/tool-taiwan-indoor-ski.jpg';
import helmetCheck from '../assets/tools/tool-helmet-check.jpg';
import snowReport from '../assets/tools/tool-snow-report.jpg';
import fatigueCheck from '../assets/tools/tool-fatigue-check.jpg';

/**
 * 工具卡片的背景圖，key 是工具的網址。
 * 第三方照片的授權與出處列在 consts.ts 的 IMAGE_CREDITS，頁尾會自動顯示；
 * 本站自己畫的插圖（雪場即時狀況回饋單、疲勞指數監測）不是第三方素材，不列在那裡，
 * 原始向量檔就放在圖片旁邊的同名 .svg。
 */
export const TOOL_IMAGES: Record<string, { image: ImageMetadata; alt: string }> = {
  '/tools/fitness-check': {
    image: fitnessCheck,
    alt: '一個人做單腳深蹲，下肢肌肉出力的特寫',
  },
  '/tools/training-plan': {
    image: trainingPlan,
    alt: '健身房中一個人正在做槓鈴深蹲',
  },
  '/tools/injury-triage': {
    image: injuryTriage,
    alt: '山區搜救人員以擔架後送傷者',
  },
  '/tools/return-to-snow': {
    image: returnToSnow,
    alt: '一個人站在雪道頂端，前方是連綿的雪山',
  },
  '/tools/pre-trip-checklist': {
    image: preTripChecklist,
    alt: '雪板、雪鞋與雪杖整齊排列在雪地上',
  },
  '/tools/xray-check': {
    image: xrayCheck,
    alt: '膝關節的 X 光影像',
  },
  '/tools/japan-resorts': {
    image: japanResorts,
    alt: '北海道富良野雪場的冬季景色',
  },
  '/tools/concussion': {
    image: concussion,
    alt: '戴著安全帽與雪鏡的滑雪者特寫',
  },
  '/tools/taiwan-indoor-ski': {
    image: taiwanIndoorSki,
    alt: '新竹小叮噹科學主題樂園的室內真雪滑雪場',
  },
  '/tools/helmet-check': {
    image: helmetCheck,
    alt: '雪山稜線上的滑雪道，兩側是覆雪的樹林',
  },
  '/tools/snow-report': {
    image: snowReport,
    alt: '雪山稜線與纜車的夜色雪場插圖',
  },
  '/tools/fatigue-check': {
    image: fatigueCheck,
    alt: '運動手錶與心率波形、雪山背景的插圖',
  },
};
