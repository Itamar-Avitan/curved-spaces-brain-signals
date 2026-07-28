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
    const lines = workedLines("covariance-matrix");

    // X Xᵀ is itself computed and displayed, one row per line. xx and xy
    // share the top row; xy repeats (matrix symmetry) alongside yy on the
    // bottom row. Pair each value with its line-mate, rather than a bare
    // `toContain`, so a wrong entry on either side is caught instead of
    // being masked by its neighbour.
    const xxtTop = lines.find((line) => line.includes("X Xᵀ = ["));
    const xxtBottom = lines[lines.indexOf(xxtTop!) + 1];
    expect(xxtTop).toContain(`[${dot(X[0], X[0])}  ${dot(X[0], X[1])}]`); // [10  10]
    expect(xxtBottom).toContain(`[${dot(X[1], X[0])}  ${dot(X[1], X[1])}]`); // [10  14]

    // C = X Xᵀ / (n − 1). xx and xy (both 2.50 here) share the top row; xy
    // repeats on the bottom row alongside yy. Same pairing trick: a bare
    // `text.toContain("2.50")` would still pass if either entry were wrong,
    // since the other would still supply a match somewhere in the block.
    const cTop = lines.find((line) => line.includes("C = X Xᵀ / 4 = ["));
    const cBottom = lines[lines.indexOf(cTop!) + 1];
    expect(cTop).toContain(`[${fmt(c(X[0], X[0]))}  ${fmt(c(X[0], X[1]))}]`); // [2.50  2.50]
    expect(cBottom).toContain(`[${fmt(c(X[1], X[0]))}  ${fmt(c(X[1], X[1]))}]`); // [2.50  3.50]
  });

  it("congruence + affine-invariant: the ruler does not move, the flat one does", () => {
    const P: Sym2 = [4, 0, 0.25];
    const Q: Sym2 = [0.25, 0, 4];
    const W: Mat2 = [1.6, 0.7, 0, 0.8];
    const frob = (a: Sym2, b: Sym2) =>
      Math.sqrt((a[0] - b[0]) ** 2 + 2 * (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

    const lines = workedLines("affine-invariant");
    const text = lines.join("\n");
    const flatBefore = frob(P, Q);
    const flatAfter = frob(congruence(W, P), congruence(W, Q));

    // The claim itself, asserted rather than displayed.
    expect(fmt(distance(P, Q))).toBe(fmt(distance(congruence(W, P), congruence(W, Q))));

    // δ = 3.92 appears twice — before and after rewiring — because the
    // ruler is claimed not to move. That equality is the whole point of the
    // box, so assert each occurrence on its own line instead of a single
    // `toContain` that either line could satisfy on its own.
    const deltaLines = lines.filter((line) => line.includes("Riemannian δ"));
    expect(deltaLines).toHaveLength(2);
    const [beforeLine, afterLine] = deltaLines;
    expect(beforeLine).toContain(fmt(distance(P, Q)));
    expect(afterLine).toContain(
      fmt(distance(congruence(W, P), congruence(W, Q))),
    );

    expect(beforeLine).toContain(fmt(flatBefore)); // 5.30
    expect(afterLine).toContain(fmt(flatAfter));   // 8.65
    // The derived figure in the closing line is pinned too.
    expect(text).toContain(`${pct(flatAfter / flatBefore - 1)}%`);
  });

  it("geodesic: the midpoint entries the box displays are pinned too", () => {
    // Task 1 pinned the determinants. The flat midpoint's own entries are
    // computed and displayed, so they are pinned here.
    const P: Sym2 = [4, 0, 0.25];
    const Q: Sym2 = [0.25, 0, 4];
    const mid = euclideanInterpolate(P, Q, 0.5);
    const lines = workedLines("geodesic");

    // Both flat-midpoint entries are 2.125 here (½(P+Q) is diagonal with
    // equal entries for this P, Q) — the duplicate is real, not a typo, so
    // scope each to its own line and assert both independently. That is
    // stronger than a single `toContain`: it actually checks the equality
    // the box is displaying, rather than only checking one side exists.
    const topLine = lines.find((line) => line.startsWith("Flat midpoint"));
    const bottomLine = lines[lines.indexOf(topLine!) + 1];
    expect(topLine).toContain(String(mid[0]));    // 2.125
    expect(bottomLine).toContain(String(mid[2])); // 2.125
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
    const lines = workedLines("log-map");
    const v = tangentVector(M, C);

    // The √2 claim: the vector's ordinary length IS the Riemannian distance.
    expect(Math.hypot(...v)).toBeCloseTo(distance(M, C), 12);

    // 0.84 appears twice — as the vector's length and as the Riemannian
    // distance — because the claim is that those two are the SAME number.
    // Scope each occurrence to its own line so a wrong value on either side
    // is caught, rather than either masking the other.
    const lengthLine = lines.find((line) => line.startsWith("  its length"));
    const distanceLine = lines.find((line) =>
      line.startsWith("  Riemannian δ(M, C)"),
    );
    expect(lengthLine).toContain(fmt(Math.hypot(...v)));
    expect(distanceLine).toContain(fmt(distance(M, C)));

    // Every intermediate matrix the box displays, to the 4 decimals it shows.
    //
    // Scoped to the block that displays each one. `logMap(M, C)` and
    // `tangentVector(M, C)` share their first and third entries by
    // construction (only the off-diagonal is scaled by √2), so an unscoped
    // `text.toContain` would let a wrong "vector" line pass on the strength of
    // the correct "log" line two rows above it.
    const d4 = (x: number) => x.toFixed(4);
    const blockAt = (label: string): string => {
      const start = lines.findIndex((line) => line.startsWith(label));
      if (start === -1) throw new Error(`No "${label}" row in the log-map box`);
      return lines.slice(start, start + 2).join("\n");
    };

    for (const [label, values] of [
      ["  whitened", recenter(M, C)],
      ["  log", logMap(M, C)],
      ["  vector", v],
    ] as const) {
      const block = blockAt(label);
      for (const value of values) expect(block).toContain(d4(value));
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

    const before = distance(C, session[0]);
    const after = distance(recenter(M, C), recenter(M, session[0]));

    // …and nothing inside the session was damaged.
    expect(before).toBeCloseTo(after, 12);

    const lines = workedLines("recentering");

    // The box *displays* the identity it lands on. Without this the displayed
    // block was free to drift from the computed one: the assertions above pin
    // `recenter(M, M)`, but nothing tied that to the "[1  0] / [0  1]" the
    // reader is actually shown.
    const shown = (x: number) => String(Math.round(x));
    const identityStart = lines.findIndex((line) =>
      line.startsWith("  recentre M by itself"),
    );
    expect(identityStart).toBeGreaterThan(-1);
    const identityBlock = lines
      .slice(identityStart, identityStart + 2)
      .join("\n");
    expect(identityBlock).toContain(`[${shown(moved[0])}  ${shown(moved[1])}]`);
    expect(identityBlock).toContain(`[${shown(moved[1])}  ${shown(moved[2])}]`);

    // δ = 0.18 before and after re-centring — the equality IS the claim,
    // so scope each occurrence to its own line rather than a single
    // `toContain` that either line could satisfy on its own.
    const beforeLine = lines.find((line) => line.startsWith("  δ(C, C₁)"));
    const afterLine = lines.find((line) =>
      line.startsWith("  δ(recentred C"),
    );
    expect(beforeLine).toContain(fmt(before));
    expect(afterLine).toContain(fmt(after));
  });
});
