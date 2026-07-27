import { describe, expect, it } from "vitest";
import { flatMapReadout, UNIT_DIRECTION } from "./flat-map";
import { distance, expMap, type Sym2 } from "../math/spd";

const IDENTITY: Sym2 = [1, 0, 1];
const OFF_BASE: Sym2 = [2.4, 0.6, 1.3];

const ratio = (base: Sym2, t: number) => {
  const { riemannian, flat } = flatMapReadout(base, UNIT_DIRECTION, t);
  return flat / riemannian;
};

describe("flat-map readout", () => {
  it("reports the separation it was asked for", () => {
    expect(flatMapReadout(IDENTITY, UNIT_DIRECTION, 1.7).riemannian).toBeCloseTo(1.7, 9);
    expect(flatMapReadout(OFF_BASE, UNIT_DIRECTION, 1.7).riemannian).toBeCloseTo(1.7, 9);
  });

  it("agrees with the curved ruler at the base point", () => {
    expect(ratio(IDENTITY, 0.01)).toBeCloseTo(1, 2);
    expect(ratio(OFF_BASE, 0.01)).toBeCloseTo(1, 2);
  });

  it("diverges, monotonically, as the points separate", () => {
    for (const base of [IDENTITY, OFF_BASE]) {
      expect(ratio(base, 4)).toBeGreaterThan(3);
      for (let t = 0.1; t < 4; t += 0.1) {
        expect(ratio(base, t + 0.1)).toBeGreaterThan(ratio(base, t));
      }
    }
  });

  it("is identical from any base point — because it whitens first", () => {
    for (const t of [0.01, 0.5, 1, 4]) {
      expect(ratio(OFF_BASE, t)).toBeCloseTo(ratio(IDENTITY, t), 9);
    }
  });

  it("REGRESSION: without whitening the claim is false, which is why we whiten", () => {
    // This is the bug the widget must never regress into. Measuring Frobenius
    // on the raw entries from a non-identity base does NOT agree at t → 0.
    const raw = (t: number) => {
      const far = expMap(OFF_BASE, [
        UNIT_DIRECTION[0] * t,
        UNIT_DIRECTION[1] * t,
        UNIT_DIRECTION[2] * t,
      ]);
      const frob = Math.sqrt(
        (OFF_BASE[0] - far[0]) ** 2 +
          2 * (OFF_BASE[1] - far[1]) ** 2 +
          (OFF_BASE[2] - far[2]) ** 2,
      );
      return frob / distance(OFF_BASE, far);
    };
    expect(raw(0.01)).toBeGreaterThan(2);
  });
});
