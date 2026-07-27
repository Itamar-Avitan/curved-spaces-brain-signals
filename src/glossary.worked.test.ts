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

const worked = (key: string) => {
  const w = GLOSSARY[key]?.formula?.worked;
  if (!w) throw new Error(`No worked example for "${key}"`);
  return w.lines.join("\n");
};

describe("worked examples do not drift from src/math/spd.ts", () => {
  it("geodesic: the flat midpoint swells and the geodesic one does not", () => {
    const A: Sym2 = [4, 0, 0.25];
    const B: Sym2 = [0.25, 0, 4];
    const text = worked("geodesic");

    expect(text).toContain(fmt(determinant(euclideanInterpolate(A, B, 0.5))));
    expect(text).toContain(fmt(determinant(geodesic(A, B, 0.5))));
    expect(text).toContain(
      fmt1(determinant(euclideanInterpolate(A, B, 0.5)) / determinant(A)),
    );
  });
});
