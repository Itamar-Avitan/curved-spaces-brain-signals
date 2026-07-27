import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";
import {
  arithmeticMean,
  congruence,
  determinant,
  distance,
  euclideanInterpolate,
  geodesic,
  logMap,
  recenter,
  riemannianMean,
  tangentVector,
  totalSquaredDistance,
  type Mat2,
  type Sym2,
} from "./math/spd";

/** Every checked value is written to 2 decimals, in the glossary and here. */
const fmt = (x: number) => x.toFixed(2);

/** The closing sentence's swelling ratio is written to 1 decimal, not 2. */
const fmt1 = (x: number) => x.toFixed(1);

/** Whole-number percentages, for derived figures like "63%". */
const pct = (x: number) => (x * 100).toFixed(0);

const workedLines = (key: string): string[] => {
  const w = GLOSSARY[key]?.formula?.worked;
  if (!w) throw new Error(`No worked example for "${key}"`);
  return w.lines;
};

/** The whole worked block as one string, for checks that span lines. */
const worked = (key: string): string => workedLines(key).join("\n");

describe("worked examples do not drift from src/math/spd.ts", () => {
  it("geodesic: the flat midpoint swells and the geodesic one does not", () => {
    const A: Sym2 = [4, 0, 0.25];
    const B: Sym2 = [0.25, 0, 4];
    const lines = workedLines("geodesic");
    const text = lines.join("\n");

    expect(text).toContain(fmt(determinant(euclideanInterpolate(A, B, 0.5))));

    // "1.00" also appears in the "Both describe..." line (det(A) = det(B) = 1
    // too), so a bare `text.toContain` here would pass even if the Geodesic
    // midpoint line itself were wrong. Scope the check to that line alone.
    const geodesicMidpointLine = lines.find((line) =>
      line.startsWith("Geodesic midpoint"),
    );
    expect(geodesicMidpointLine).toContain(
      fmt(determinant(geodesic(A, B, 0.5))),
    );

    // Scoped with the "×" the sentence actually uses, not a bare numeral —
    // "det = 4.52" elsewhere in the block has no "×" after it, so this can't
    // be satisfied by that unrelated line.
    const ratio =
      determinant(euclideanInterpolate(A, B, 0.5)) / determinant(A);
    expect(text).toContain(`${fmt1(ratio)}×`);
  });

  it("covariance-matrix: the 2×2 table from a 2×5 trial", () => {
    // Recompute rather than trusting the string: C = X Xᵀ / (n − 1), n = 5.
    const X = [
      [2, -1, 0, 1, -2],
      [1, -2, 1, 2, -2],
    ];
    const dot = (a: number[], b: number[]) =>
      a.reduce((sum, value, i) => sum + value * b[i], 0);

    expect(dot(X[0], Array(5).fill(1))).toBe(0); // rows are already centred
    expect(dot(X[1], Array(5).fill(1))).toBe(0);

    const n = X[0].length;
    const c = (a: number[], b: number[]) => dot(a, b) / (n - 1);
    const text = worked("covariance-matrix");

    expect(text).toContain(fmt(c(X[0], X[0]))); // 2.50
    expect(text).toContain(fmt(c(X[0], X[1]))); // 2.50
    expect(text).toContain(fmt(c(X[1], X[1]))); // 3.50
  });

  it("congruence + affine-invariant: the ruler does not move, the flat one does", () => {
    const P: Sym2 = [4, 0, 0.25];
    const Q: Sym2 = [0.25, 0, 4];
    const W: Mat2 = [1.6, 0.7, 0, 0.8];
    const frob = (a: Sym2, b: Sym2) =>
      Math.sqrt((a[0] - b[0]) ** 2 + 2 * (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

    const text = worked("affine-invariant");
    const flatBefore = frob(P, Q);
    const flatAfter = frob(congruence(W, P), congruence(W, Q));

    // The claim itself, asserted rather than displayed.
    expect(fmt(distance(P, Q))).toBe(fmt(distance(congruence(W, P), congruence(W, Q))));

    expect(text).toContain(fmt(distance(P, Q))); // 3.92, and again after rewiring
    expect(text).toContain(fmt(flatBefore));     // 5.30
    expect(text).toContain(fmt(flatAfter));      // 8.65
    // The derived figure in the closing line is pinned too.
    expect(text).toContain(`${pct(flatAfter / flatBefore - 1)}%`);
  });

  it("geodesic: the midpoint entries the box displays are pinned too", () => {
    // Task 1 pinned the determinants. The flat midpoint's own entries are
    // computed and displayed, so they are pinned here.
    const P: Sym2 = [4, 0, 0.25];
    const Q: Sym2 = [0.25, 0, 4];
    const mid = euclideanInterpolate(P, Q, 0.5);
    const text = worked("geodesic");
    expect(text).toContain(String(mid[0]));   // 2.125
    expect(text).toContain(String(mid[2]));   // 2.125
  });

  it("riemannian-mean: the Riemannian centre beats the flat one on its own objective", () => {
    const trials: Sym2[] = [[4, 0, 0.25], [0.25, 0, 4], [1, 0.5, 1]];
    const text = worked("riemannian-mean");
    const riemannian = totalSquaredDistance(riemannianMean(trials), trials);
    const flat = totalSquaredDistance(arithmeticMean(trials), trials);

    // The centre is defined as the minimiser, so it must win on this objective.
    expect(riemannian).toBeLessThan(flat);
    expect(text).toContain(fmt(riemannian));   // 8.17
    expect(text).toContain(fmt(flat));         // 10.37
  });

  it("mdm: the two distances, and which one wins", () => {
    const leftTrials: Sym2[] = [[3.0, 0.8, 1.0], [2.6, 0.6, 1.2], [3.4, 1.0, 0.9]];
    const rightTrials: Sym2[] = [[1.0, -0.5, 3.0], [1.2, -0.7, 2.7], [0.9, -0.4, 3.3]];
    const C: Sym2 = [2.8, 0.7, 1.1];
    const text = worked("mdm");
    const toLeft = distance(C, riemannianMean(leftTrials));
    const toRight = distance(C, riemannianMean(rightTrials));

    expect(toLeft).toBeLessThan(toRight);
    expect(text).toContain(fmt(toLeft));    // 0.17
    expect(text).toContain(fmt(toRight));   // 1.78
  });

  it("log-map: the √2 makes the vector length equal the distance", () => {
    const M: Sym2 = [2, 0.3, 2];
    const C: Sym2 = [2.8, 0.7, 1.1];
    const text = worked("log-map");
    const v = tangentVector(M, C);

    // The √2 claim: the vector's ordinary length IS the Riemannian distance.
    expect(Math.hypot(...v)).toBeCloseTo(distance(M, C), 12);
    expect(text).toContain(fmt(distance(M, C))); // 0.84, shown twice

    // Every intermediate matrix the box displays, to the 4 decimals it shows.
    const d4 = (x: number) => x.toFixed(4);
    for (const value of [...recenter(M, C), ...logMap(M, C), ...v]) {
      expect(text).toContain(d4(value));
    }
  });

  it("recentering: the reference lands on the identity and distances survive", () => {
    const session: Sym2[] = [[3.0, 0.8, 1.0], [2.6, 0.6, 1.2], [3.4, 1.0, 0.9]];
    const M = riemannianMean(session);
    const C: Sym2 = [2.8, 0.7, 1.1];
    const moved = recenter(M, M);

    // The reference lands exactly on the identity.
    expect(moved[0]).toBeCloseTo(1, 12);
    expect(moved[1]).toBeCloseTo(0, 12);
    expect(moved[2]).toBeCloseTo(1, 12);

    // …and nothing inside the session was damaged.
    expect(distance(C, session[0])).toBeCloseTo(
      distance(recenter(M, C), recenter(M, session[0])),
      12,
    );
    expect(worked("recentering")).toContain(fmt(distance(C, session[0])));   // 0.18
  });
});
