import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";
import {
  determinant,
  euclideanInterpolate,
  geodesic,
  type Sym2,
} from "./math/spd";

/** Every checked value is written to 2 decimals, in the glossary and here. */
const fmt = (x: number) => x.toFixed(2);

/** The closing sentence's swelling ratio is written to 1 decimal, not 2. */
const fmt1 = (x: number) => x.toFixed(1);

const workedLines = (key: string): string[] => {
  const w = GLOSSARY[key]?.formula?.worked;
  if (!w) throw new Error(`No worked example for "${key}"`);
  return w.lines;
};

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
});
