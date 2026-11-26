export const REALM_COUNT = 4;
export const SPEEDLINE_SCROLL_DELTA = 35;

export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  const maxScroll = scrollHeight - viewportHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(Math.max(scrollY / maxScroll, 0), 1);
}

export function realmIndexFromProgress(progress: number): number {
  return Math.min(Math.floor(progress * REALM_COUNT), REALM_COUNT - 1);
}
