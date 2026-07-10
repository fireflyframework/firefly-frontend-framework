/**
 * Clamps a number to the 0..100 integer range (progress-bar safety).
 *
 * @example
 * clampPercent(142)   // => 100
 * clampPercent(-3)    // => 0
 * clampPercent(42.6)  // => 43
 */
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * `clampPercent` over a 0..1 ratio.
 *
 * @example
 * ratioToPercent(0.42)  // => 42
 * ratioToPercent(1.3)   // => 100
 */
export function ratioToPercent(ratio: number): number {
  return clampPercent(ratio * 100);
}
