import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

let unshallowTried = false;

/** Cloudflare Pages 預設是淺層 clone，沒有完整歷史就抓不到每個檔案的最後修改時間 */
function ensureFullHistory() {
  if (unshallowTried) return;
  unshallowTried = true;
  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (shallow === 'true') {
      execFileSync('git', ['fetch', '--unshallow', '--quiet'], {
        stdio: 'ignore',
        timeout: 60_000,
      });
    }
  } catch {
    /* 抓不到就算了，下面會用 fallback */
  }
}

/**
 * 取得某個檔案「最後一次被修改」的時間。
 * 優先用 git 的 commit 時間（這樣每次改文章、重新部署後日期會自動更新），
 * 抓不到時退回檔案系統的 mtime，再不行就回傳 null 由呼叫端用發佈日期。
 */
export function lastUpdated(filePath?: string): Date | null {
  if (!filePath) return null;
  ensureFullHistory();

  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) {
      const d = new Date(out);
      if (!Number.isNaN(d.valueOf())) return d;
    }
  } catch {
    /* fall through */
  }

  try {
    return statSync(filePath).mtime;
  } catch {
    return null;
  }
}
