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

/* ── 日期題（「預計幾月幾號出發？」）────────────────────────────────
 *
 * 跟一般題不一樣的地方：使用者填的是一個日期，票數以「半個月」為單位彙總，
 * 所以結果那幾條長條是投完票才知道有哪些、要用 JS 生出來的。
 */

/** '2027-01-H1' → '2027 年 1 月上半' */
export const bucketLabel = (id: string): string => {
  const m = /^(\d{4})-(\d{2})-(H1|H2)$/.exec(id);
  if (!m) return id;
  return `${m[1]} 年 ${Number(m[2])} 月${m[3] === 'H1' ? '上半' : '下半'}`;
};

/** 半個月是哪幾號 */
export const bucketRange = (id: string): string =>
  id.endsWith('H1') ? '1–15 日' : '16 日以後';

const isoDay = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const dateBucketOf = (iso: string): string | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${Number(m[3]) <= 15 ? 'H1' : 'H2'}`;
};

/** 顯示結果：最多人出發的時段排行，並標出你選的那一格 */
export const showDateResults = (card: HTMLElement, counts: Counts, mine: string | null) => {
  const TOP = 5;
  const entries = Object.entries(counts)
    .map(([id, n]) => [id, Number(n) || 0] as [string, number])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));

  const total = entries.reduce((s, [, n]) => s + n, 0);
  const top = entries.slice(0, TOP);
  // 你選的時段如果沒進前幾名，另外補一行，不然會找不到自己
  if (mine && !top.some(([id]) => id === mine)) {
    const found = entries.find(([id]) => id === mine);
    if (found) top.push(found);
  }

  const headline = card.querySelector<HTMLElement>('.poll-date-headline');
  if (headline) {
    if (entries.length > 0) {
      const [id, n] = entries[0];
      headline.textContent = `目前最多人出發的時段是 ${bucketLabel(id)}（${bucketRange(id)}），共 ${n.toLocaleString('zh-TW')} 票。`;
      headline.hidden = false;
    } else {
      headline.hidden = true;
    }
  }

  const list = card.querySelector<HTMLElement>('.poll-results')!;
  list.textContent = '';

  for (const [id, n] of top) {
    const pct = total ? Math.round((n / total) * 100) : 0;
    const isMine = id === mine;

    const li = document.createElement('li');
    li.className = 'min-w-0';

    const row = document.createElement('div');
    row.className = 'flex items-baseline justify-between gap-3 text-sm';

    const label = document.createElement('span');
    label.className = 'poll-label min-w-0 font-medium break-words text-white light:text-sky-950';
    label.textContent = `${bucketLabel(id)}`;
    if (isMine) {
      label.classList.add('text-accent', 'light:text-sky-700');
      const tag = document.createElement('span');
      tag.className =
        'ml-1.5 rounded-full bg-tint2 px-1.5 py-0.5 text-[10px] font-bold text-head light:bg-sky-100 light:text-sky-950';
      tag.textContent = '你選的';
      label.append(tag);
    }

    const num = document.createElement('span');
    num.className = 'shrink-0 text-xs text-body/80 tabular-nums light:text-slate-500';
    const pctEl = document.createElement('span');
    pctEl.className = 'font-black text-white light:text-sky-950';
    pctEl.textContent = `${pct}%`;
    const nEl = document.createElement('span');
    nEl.className = 'ml-1';
    nEl.textContent = `(${n.toLocaleString('zh-TW')})`;
    num.append(pctEl, nEl);

    row.append(label, num);

    const track = document.createElement('div');
    track.className = 'mt-1 h-2 w-full overflow-hidden rounded-full bg-white/15 light:bg-sky-100';
    const bar = document.createElement('div');
    bar.className = 'h-full rounded-full bg-accent transition-all duration-700 light:bg-sky-600';
    bar.style.width = `${pct}%`;
    track.append(bar);

    li.append(row, track);
    list.append(li);
  }

  card.querySelector<HTMLElement>('.poll-total')!.textContent = total.toLocaleString('zh-TW');
  card.querySelector<HTMLElement>('.poll-options')!.hidden = true;
  list.hidden = false;
  card.querySelector<HTMLElement>('.poll-footer')!.hidden = false;
  card.dataset.voted = '1';
};

/**
 * 把日期題接上行為。
 * 跟 wireCard 一樣是「每次打開都可以重填」的模式（首頁小卡片的規則）。
 */
export const wireDateCard = (card: HTMLElement, counts: Record<string, Counts> | null) => {
  const poll = card.dataset.poll!;
  const input = card.querySelector<HTMLInputElement>('.poll-date-input');
  const btn = card.querySelector<HTMLButtonElement>('.poll-date-submit');
  const note = card.querySelector<HTMLElement>('.poll-date-note');
  const rec = card.querySelector<HTMLAnchorElement>('[data-rec]');
  if (!input || !btn) return;

  // 可以填的範圍：往前 7 天到往後兩年，跟後端的檢查一致
  input.min = isoDay(new Date(Date.now() - 7 * 86400000));
  input.max = isoDay(new Date(Date.now() + 730 * 86400000));

  const fail = (text: string) => {
    if (!note) return;
    note.textContent = text;
    note.hidden = false;
  };

  btn.addEventListener('click', async () => {
    if (card.dataset.voted === '1') return;
    const date = input.value;
    if (!dateBucketOf(date)) {
      fail('先選一個日期再送出。');
      input.focus();
      return;
    }
    if (note) note.hidden = true;
    btn.disabled = true;
    input.disabled = true;

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ poll, date }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error ?? 'vote failed');

      if (rec) {
        // 把日期一起帶去訓練計畫產生器，那邊會自動填好
        rec.href = `${rec.dataset.href ?? rec.pathname}?date=${encodeURIComponent(date)}`;
        rec.hidden = false;
      }
      showDateResults(card, data.counts as Counts, data.bucket as string);
      (window as any).snowmedTrack?.('vote', `${poll}/${data.bucket}`);
    } catch {
      btn.disabled = false;
      input.disabled = false;
      fail('暫時送不出去，等一下再試一次。');
    }
  });

  // 還沒填就先讓他看得到目前的分布？不 —— 先填再看，才有「猜猜看」的樂趣。
  void counts;
};
