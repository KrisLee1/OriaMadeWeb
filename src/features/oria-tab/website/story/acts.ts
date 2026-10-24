// Nine acts share one story clock. Each act owns ten units; transitions overlap the boundaries.
export const acts = ['begin', 'search', 'organize', 'imagine', 'on-the-web', 'appearance', 'local', 'family', 'get'] as const
export const TOTAL = 90
/** Where each act settles: navigation, soft snapping and the reduced-motion stills use these frames. */
export const rest = [0, 15.2, 24.2, 35.4, 46.6, 58.2, 66.4, 76.4, 86.2]
/** Caption visibility for each act. */
export const captions: readonly (readonly [number, number, number, number])[] = [
  [-1, -1, 4.6, 6.4],
  [10.2, 11.2, 18.6, 19.6],
  [20.2, 21.2, 28.8, 29.8],
  [30.2, 31.2, 38, 39],
  [40.6, 41.6, 48.4, 49.4],
  [49.8, 50.8, 59.2, 60.2],
  [60.4, 61.6, 68.8, 69.8],
  [70.4, 71.6, 78.8, 79.8],
  [80.4, 81.6, 91, 92],
]
export const actAt = (t: number) => Math.min(acts.length - 1, Math.max(0, Math.floor((t + .6) / 10)))
