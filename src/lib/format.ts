const fmt = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Taipei',
});

/** 2026/09/12 */
export function formatDate(d: Date): string {
  return fmt.format(d).replaceAll('/', '/');
}

/** 判斷「最後更新」是否明顯晚於發佈日（差一天以上才顯示更新日期） */
export function isUpdated(published: Date, updated: Date | null): boolean {
  if (!updated) return false;
  return updated.valueOf() - published.valueOf() > 24 * 60 * 60 * 1000;
}
