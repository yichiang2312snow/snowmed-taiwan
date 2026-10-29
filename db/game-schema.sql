-- 「台灣醫療決策者體驗」遊戲的資料表（Cloudflare D1）
--
-- 套用到正式環境：
--   npx wrangler d1 execute snowmed-game --remote --file db/game-schema.sql
-- 本機開發（wrangler pages dev 會自動建一個本機 D1）：
--   npx wrangler d1 execute snowmed-game --local --file db/game-schema.sql
--
-- 分數不存在資料表裡，而是「起始 60 分 + 每回合的加減分」算出來的，
-- 所以主持人重新評分或手動改分都不會把分數算壞。

CREATE TABLE IF NOT EXISTS game_games (
  code TEXT PRIMARY KEY,                 -- 房間代碼（組長輸入用）
  status TEXT NOT NULL DEFAULT 'lobby',  -- lobby | discussing | scoring | results | ended
  round INTEGER NOT NULL DEFAULT 0,      -- 目前回合（0 = 還在大廳）
  discussion_minutes INTEGER NOT NULL DEFAULT 4,
  scoring_started_at INTEGER,            -- AI 評分開始時間（卡住時用來判斷可不可以重試）
  scoring_error TEXT,                    -- 上一次評分失敗的原因（給主持人看）
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_teams (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,            -- 組長瀏覽器用來證明「我是這一組」的祕密
  joined_at INTEGER NOT NULL,
  UNIQUE (code, name)
);
CREATE INDEX IF NOT EXISTS game_teams_code ON game_teams (code);

CREATE TABLE IF NOT EXISTS game_rounds (
  code TEXT NOT NULL,
  round INTEGER NOT NULL,
  card_id TEXT NOT NULL,
  opened_at INTEGER NOT NULL,
  deadline_at INTEGER NOT NULL,          -- 討論截止（主持人可以延長）
  scored_at INTEGER,
  summary TEXT,                          -- AI 對這一回合各組的整體評語
  PRIMARY KEY (code, round)
);

CREATE TABLE IF NOT EXISTS game_submissions (
  code TEXT NOT NULL,
  round INTEGER NOT NULL,
  team_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  submitted_at INTEGER,
  deltas TEXT,                           -- JSON：{"budget":-5,"nurses":2,...}
  explanation TEXT,
  irrelevant INTEGER NOT NULL DEFAULT 0, -- 被判定為與題目無關（或沒交）
  manual INTEGER NOT NULL DEFAULT 0,     -- 主持人手動給的分數
  PRIMARY KEY (code, round, team_id)
);
