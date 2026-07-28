import { describe, expect, it } from "vitest";
import {
  BASE_POINT,
  flatMapLayout,
  flatMapReadout,
  LEFT_ANCHOR_X,
  MAX_SEPARATION,
  RIGHT_ANCHOR_X,
  TRACK_WIDTH,
  UNIT_DIRECTION,
} from "./flat-map";
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

  it("CANARY on spd.ts: an un-whitened Frobenius ratio does not agree with the curved ruler near t → 0", () => {
    // This test does NOT call flatMapReadout — it recomputes an un-whitened
    // ratio directly from expMap/distance. It does not guard the widget; the
    // two tests above ("agrees with the curved ruler at the base point" and
    // "is identical from any base point") are what guard flatMapReadout's
    // whitening step, and they are the ones that go red if that whitening is
    // ever removed (confirmed by deliberately removing it — see the task
    // report). What THIS test guards is the underlying fact from spec §3.1
    // that makes whitening necessary in the first place: measuring Frobenius
    // on raw entries from a non-identity base disagrees with the Riemannian
    // distance even at zero separation. If spd.ts ever changed such that this
    // stopped being true, the whole section's premise would be gone, and this
    // canary would catch that independently of anything in this widget.
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

/**
 * The picture must not contradict the numbers printed underneath it. That is
 * not hypothetical here — an earlier revision of this widget drew the two gaps
 * on unrelated scales and told the reader the opposite of its own readouts.
 * The single fact that prevents it is that both panels are laid out at one
 * shared pixels-per-unit, derived from the flat reading at the slider's
 * maximum. `TRACK_WIDTH`, `LEFT_ANCHOR_X`, `RIGHT_ANCHOR_X` and
 * `MAX_SEPARATION` all feed that derivation, so any of them can break it.
 */
describe("flat-map picture agrees with flat-map numbers", () => {
  const SWEEP = [0, 0.01, 0.25, 0.5, 1, 2, 3, MAX_SEPARATION];
  const at = (t: number) => {
    const readout = flatMapReadout(BASE_POINT, UNIT_DIRECTION, t);
    return { readout, layout: flatMapLayout(readout) };
  };

  it("draws both panels at one shared pixels-per-unit", () => {
    // The scale is read back out of the layout rather than re-derived here:
    // recomputing TRACK_WIDTH / MAX_FLAT in the test would only assert that
    // the test can do arithmetic.
    const far = at(MAX_SEPARATION);
    const scale =
      (far.layout.rightX - RIGHT_ANCHOR_X) / far.readout.flat;

    for (const t of SWEEP) {
      const { readout, layout } = at(t);
      expect((layout.leftX - LEFT_ANCHOR_X) / scale).toBeCloseTo(
        readout.riemannian,
        9,
      );
      expect((layout.rightX - RIGHT_ANCHOR_X) / scale).toBeCloseTo(
        readout.flat,
        9,
      );
    }
  });

  it("never draws the smaller number as the longer gap", () => {
    for (const t of SWEEP) {
      const { readout, layout } = at(t);
      const globeGap = layout.leftX - LEFT_ANCHOR_X;
      const mapGap = layout.rightX - RIGHT_ANCHOR_X;
      if (readout.flat > readout.riemannian) {
        expect(mapGap).toBeGreaterThan(globeGap);
      } else {
        expect(mapGap).toBeCloseTo(globeGap, 9);
      }
    }
  });

  it("fills the flat track exactly at the slider's maximum, and never overflows", () => {
    for (const t of SWEEP) {
      expect(at(t).layout.overflowing).toBe(false);
    }
    expect(at(MAX_SEPARATION).layout.rightX).toBeCloseTo(
      RIGHT_ANCHOR_X + TRACK_WIDTH,
      9,
    );
  });

  it("keeps the globe point inside its own track, so the two panels stay apart", () => {
    expect(LEFT_ANCHOR_X + TRACK_WIDTH).toBeLessThan(RIGHT_ANCHOR_X);
    for (const t of SWEEP) {
      expect(at(t).layout.leftX).toBeLessThan(LEFT_ANCHOR_X + TRACK_WIDTH);
    }
  });

  it("collapses the arc onto the anchor when the points coincide", () => {
    const { layout } = at(0);
    expect(layout.leftX).toBeCloseTo(LEFT_ANCHOR_X, 9);
    expect(layout.rightX).toBeCloseTo(RIGHT_ANCHOR_X, 9);
    expect(layout.leftArcHeight).toBeCloseTo(0, 9);
  });
});
