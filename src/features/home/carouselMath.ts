/**
 * Pure helpers for the promo carousel. They run inside Reanimated worklets on the UI
 * thread (hence the 'worklet' directive) and as plain functions in tests.
 */

/** Page under the viewport for a horizontal offset, clamped to the slide range. */
export function pageForOffset(offset: number, pageWidth: number, count: number): number {
  'worklet';
  if (pageWidth <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(offset / pageWidth)));
}

/** 1 when slide `index` is centred, falling linearly to 0 one page away. */
export function dotEmphasis(progress: number, index: number): number {
  'worklet';
  return Math.max(0, 1 - Math.abs(progress - index));
}

export const DOT_SIZE = 8;
export const DOT_ACTIVE_WIDTH = 24;

/** Pill width for a given emphasis: 8pt idle, 24pt active, continuous in between. */
export function dotWidth(emphasis: number): number {
  'worklet';
  return DOT_SIZE + (DOT_ACTIVE_WIDTH - DOT_SIZE) * emphasis;
}
