import type { Sym2 } from "../math/spd";

/**
 * The one concrete MDM trial the page reuses everywhere it needs worked
 * numbers, rather than three hand-typed copies that can silently drift
 * apart: `<rg-case-file>`'s live "left vs. right" strip (`case-file.ts`)
 * computes its distances from these matrices, and
 * `glossary.worked.test.ts` imports the same matrices for the `mdm` and
 * `recentering` worked-example checks. That means the test pins the
 * glossary's hardcoded display strings against the exact matrices the
 * widget renders — change an entry here and both the widget's live output
 * and the test's expectations move together, instead of only one of them
 * noticing.
 */
export const LEFT_TRIALS: Sym2[] = [
  [3.0, 0.8, 1.0],
  [2.6, 0.6, 1.2],
  [3.4, 1.0, 0.9],
];

export const RIGHT_TRIALS: Sym2[] = [
  [1.0, -0.5, 3.0],
  [1.2, -0.7, 2.7],
  [0.9, -0.4, 3.3],
];

export const TRIAL: Sym2 = [2.8, 0.7, 1.1];
