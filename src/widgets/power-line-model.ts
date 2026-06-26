/**
 * One-electrode grounding model (the simplest possible decoder).
 *
 * A single EEG channel, band-pass filtered, is summarised by one number: its
 * band power (= variance). Imagining a movement lowers mu/beta power (event-
 * related desynchronisation), so "rest" and "move" become two typical power
 * levels. Classifying a new trial = assign it to the nearer class mean. That is
 * Minimum Distance to Mean in one dimension.
 *
 * The teaching point: power lives on a ratio (log) scale, so the *right*
 * distance is |log a - log b|, not |a - b|. The arithmetic and geometric
 * decision boundaries genuinely differ, and a trial between them flips label
 * depending on which distance you trust.
 */

/** Typical band power at rest (normalised units). */
export const REST_POWER = 1;
/** Typical band power during motor imagery — lower (ERD). */
export const MOVE_POWER = 0.32;

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

/**
 * True band power of a trial as the imagined-movement strength goes 0 -> 1.
 * Interpolated geometrically (on the log scale) between the two class means,
 * because that is the scale power actually lives on.
 */
export function trialPower(movement: number): number {
  const m = clamp(movement, 0, 1);
  return REST_POWER * Math.pow(MOVE_POWER / REST_POWER, m);
}

/** A single band-limited trace whose amplitude matches the trial's power. */
export function bandTrace(movement: number, samples = 180): number[] {
  const amplitude = Math.sqrt(trialPower(movement));
  const trace: number[] = [];
  for (let index = 0; index < samples; index += 1) {
    const t = (index / samples) * Math.PI * 14;
    const wave =
      Math.sin(t) * 0.82 +
      Math.sin(t * 1.7 + 0.5) * 0.3 +
      Math.cos(t * 0.6 - 0.2) * 0.16;
    trace.push(amplitude * wave);
  }
  return trace;
}

/** Linear (arithmetic) decision boundary between the two class means. */
export const ARITHMETIC_BOUNDARY = (REST_POWER + MOVE_POWER) / 2;
/** Log (geometric) decision boundary — the correct one for a ratio scale. */
export const GEOMETRIC_BOUNDARY = Math.sqrt(REST_POWER * MOVE_POWER);

export type ClassLabel = "rest" | "move";

/** Nearest-mean prediction, using either the straight-line or the log distance. */
export function classify(power: number, useLogDistance: boolean): ClassLabel {
  const distance = (a: number, b: number): number =>
    useLogDistance ? Math.abs(Math.log(a / b)) : Math.abs(a - b);
  return distance(power, REST_POWER) <= distance(power, MOVE_POWER)
    ? "rest"
    : "move";
}

/** Whether a trial sits in the zone where the two distances disagree. */
export function inDisagreementZone(power: number): boolean {
  const lo = Math.min(ARITHMETIC_BOUNDARY, GEOMETRIC_BOUNDARY);
  const hi = Math.max(ARITHMETIC_BOUNDARY, GEOMETRIC_BOUNDARY);
  return power > lo && power < hi;
}
