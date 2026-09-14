/**
 * 雪友投票的前端共用邏輯。
 *
 * 首頁 HERO 的小卡片（HeroPoll.astro）與完整的投票區（Polls.astro）都用這一份，
 * 投過的紀錄也共用同一個 localStorage key，所以在哪裡投都算同一票。
 */

const KEY = 'snowmed:polls';

export type Counts = Record<string, number>;
export type Votes = Record<string, string>;

export const readVotes = (): Votes => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const saveVote = (poll: string, option: string) => {
  const v = readVotes();
  v[poll] = option;
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* 無痕模式寫不進去就算了，這次瀏覽仍然有效 */
  }
};

export const fetchCounts = async (): Promise<Record<string, Counts> | null> => {
  try {
    const res = await fetch('/api/polls');
    const data = await res.json();
    return data?.polls ?? null;
  } catch {
    return null;
  }
};

export const sendVote = async (poll: string, option: string): Promise<Counts> => {
  const res = await fetch('/api/polls', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ poll, option }),
  });
  const data = await res.json();
  if (!data?.ok) throw new Error('vote failed');
  return data.counts as Counts;
};

/**
 * 把一張投票卡片切換成「結果」狀態。
 * 卡片需要有 .poll-options / .poll-results / .poll-footer，
 * 以及每個選項的 [data-result] 內含 .poll-label .poll-pct .poll-n .poll-bar。
 */
export const showResults = (card: HTMLElement, counts: Counts, mine: string | null) => {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  for (const li of card.querySelectorAll<HTMLElement>('[data-result]')) {
    const id = li.dataset.result!;
    const n = counts[id] ?? 0;
    const pct = total ? Math.round((n / total) * 100) : 0;
    li.querySelector('.poll-pct')!.textContent = `${pct}%`;
    li.querySelector('.poll-n')!.textContent = `(${n.toLocaleString('zh-TW')})`;
    (li.querySelector('.poll-bar') as HTMLElement).style.width = `${pct}%`;
    const label = li.querySelector('.poll-label')!;
    label.classList.toggle('text-accent', id === mine);
    label.classList.toggle('light:text-sky-700', id === mine);
    if (id === mine && !li.querySelector('.poll-you')) {
      const tag = document.createElement('span');
      tag.className =
        'poll-you ml-1.5 rounded-full bg-tint2 px-1.5 py-0.5 text-[10px] font-bold text-head light:bg-sky-100 light:text-sky-950';
      tag.textContent = '你的選擇';
      label.append(tag);
    }
  }
  card.querySelector<HTMLElement>('.poll-total')!.textContent = total.toLocaleString('zh-TW');
  card.querySelector<HTMLElement>('.poll-options')!.hidden = true;
  card.querySelector<HTMLElement>('.poll-results')!.hidden = false;
  card.querySelector<HTMLElement>('.poll-footer')!.hidden = false;
  // 依他選的答案，亮出對應的工具推薦
  for (const rec of card.querySelectorAll<HTMLElement>('[data-rec]')) {
    rec.hidden = rec.dataset.rec !== mine;
  }
  card.dataset.voted = '1';
};

/**
 * 把一張卡片接上投票行為。
 *
 * remember = true：投過的題目記在 localStorage，回來直接看結果、不能重投。
 * remember = false：每次打開網頁都是新的一輪——同一次瀏覽裡每題只能投一次，
 *   重新整理就可以再投、再拿一次推薦。首頁的小卡片用這個模式，
 *   代價是同一個人重複來會重複計票。
 */
export const wireCard = (
  card: HTMLElement,
  counts: Record<string, Counts> | null,
  opts: { remember?: boolean; onVoted?: (poll: string, option: string) => void } = {}
) => {
  const { remember = true, onVoted } = opts;
  const poll = card.dataset.poll!;
  const voted = remember ? readVotes() : {};

  if (voted[poll] && counts?.[poll]) showResults(card, counts[poll], voted[poll]);

  const buttons = card.querySelectorAll<HTMLButtonElement>('[data-option]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (card.dataset.voted === '1' || (remember && readVotes()[poll])) return;
      buttons.forEach((b) => (b.disabled = true));
      const option = btn.dataset.option!;
      try {
        const next = await sendVote(poll, option);
        if (remember) saveVote(poll, option);
        showResults(card, next, option);
        (window as any).snowmedTrack?.('vote', `${poll}/${option}`);
        onVoted?.(poll, option);
      } catch {
        buttons.forEach((b) => (b.disabled = false));
        const note = card.querySelector<HTMLElement>('.poll-footer')!;
        note.textContent = '暫時投不進去，等一下再試一次。';
        note.hidden = false;
      }
    });
  });
};
