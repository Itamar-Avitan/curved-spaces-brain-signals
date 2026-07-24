import { describe, expect, it } from "vitest";
import {
  arithmeticMean,
  congruence,
  determinant,
  distance,
  eigen,
  euclideanInterpolate,
  expm,
  fromEigen,
  geodesic,
  logm,
  principalAngle,
  recentre,
  riemannianMean,
  sqrtm,
  tangentDistortion,
  tangentRing,
  tangentVector,
  totalSquaredDistance,
  type Mat2,
  type Sym2,
} from "./spd";

const IDENTITY: Sym2 = [1, 0, 1];

/** Two patterns of equal total variation, differing only in which channel dominates. */
const A: Sym2 = [4, 0, 0.25];
const B: Sym2 = [0.25, 0, 4];

/** A pair that does NOT commute — B2 is A2 rotated. This is where curvature lives. */
const A2: Sym2 = [3, 0, 0.4];
const B2: Sym2 = rotate(A2, Math.PI / 3);

function rotate(s: Sym2, angle: number): Sym2 {
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  return congruence([c, -sn, sn, c], s);
}

function closeTo(actual: Sym2, expected: Sym2, precision = 8) {
  actual.forEach((value, index) => {
    expect(value).toBeCloseTo(expected[index], precision);
  });
}

describe("eigen / fromEigen", () => {
  it("round-trips an arbitrary SPD matrix", () => {
    const s: Sym2 = [2.4, -0.8, 1.1];
    const { values, angle } = eigen(s);
    closeTo(fromEigen(values, angle), s);
  });

  it("returns descending, positive eigenvalues for an SPD matrix", () => {
    const { values } = eigen([2.4, -0.8, 1.1]);
    expect(values[0]).toBeGreaterThan(values[1]);
    expect(values[1]).toBeGreaterThan(0);
  });

  it("handles the isotropic case without producing NaN", () => {
    const { values, angle } = eigen(IDENTITY);
    expect(values[0]).toBeCloseTo(1);
    expect(values[1]).toBeCloseTo(1);
    expect(Number.isFinite(angle)).toBe(true);
  });
});

describe("matrix functions", () => {
  it("sqrtm squares back to the original", () => {
    const s: Sym2 = [3.1, 0.9, 1.4];
    const root = sqrtm(s);
    const { values, angle } = eigen(root);
    closeTo(fromEigen([values[0] ** 2, values[1] ** 2], angle), s);
  });

  it("expm inverts logm", () => {
    const s: Sym2 = [3.1, 0.9, 1.4];
    closeTo(expm(logm(s)), s);
  });

  it("logm is a MATRIX log, not an elementwise one", () => {
    // For a non-diagonal matrix the two disagree — this is the conflation the
    // diagonal-only widgets made invisible.
    const s: Sym2 = [3, 1.2, 2];
    expect(logm(s)[1]).not.toBeCloseTo(Math.log(s[1]), 3);
  });
});

describe("distance", () => {
  it("is zero between a matrix and itself", () => {
    expect(distance(A, A)).toBeCloseTo(0);
  });

  it("is symmetric", () => {
    expect(distance(A2, B2)).toBeCloseTo(distance(B2, A2));
  });

  it("agrees with the closed form for diagonal matrices", () => {
    // delta = sqrt( sum log^2(q_i / p_i) )
    const expected = Math.hypot(Math.log(0.25 / 4), Math.log(4 / 0.25));
    expect(distance(A, B)).toBeCloseTo(expected);
  });

  it("satisfies the triangle inequality", () => {
    const d1 = distance(A2, IDENTITY);
    const d2 = distance(IDENTITY, B2);
    expect(distance(A2, B2)).toBeLessThanOrEqual(d1 + d2 + 1e-9);
  });
});

describe("congruence invariance — the property the whole lesson rests on", () => {
  const mixings: Mat2[] = [
    [1.2, 0.7, -0.4, 0.9], // general invertible mixing (volume conduction / re-reference)
    [3, 0, 0, 0.4], // per-channel gain only
    [0, 1, -1, 0], // pure rotation
    [2.5, -1.3, 0.6, 1.8],
  ];

  it.each(mixings)(
    "Riemannian distance is unchanged by congruence %j",
    (...entries) => {
      const w = entries as unknown as Mat2;
      expect(distance(congruence(w, A2), congruence(w, B2))).toBeCloseTo(
        distance(A2, B2),
      );
    },
  );

  it("Euclidean distance is NOT invariant — this is the contrast to teach", () => {
    const w: Mat2 = [1.2, 0.7, -0.4, 0.9];
    const before = euclideanDistance(A2, B2);
    const after = euclideanDistance(congruence(w, A2), congruence(w, B2));
    expect(Math.abs(after - before)).toBeGreaterThan(0.1);
  });

  it("the Riemannian mean is congruence-equivariant", () => {
    const w: Mat2 = [1.2, 0.7, -0.4, 0.9];
    const trials: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const movedMean = riemannianMean(trials.map((t) => congruence(w, t)));
    closeTo(movedMean, congruence(w, riemannianMean(trials)), 6);
  });
});

function euclideanDistance(p: Sym2, q: Sym2): number {
  return Math.hypot(p[0] - q[0], Math.SQRT2 * (p[1] - q[1]), p[2] - q[2]);
}

describe("geodesic", () => {
  it("hits both endpoints", () => {
    closeTo(geodesic(A2, B2, 0), A2);
    closeTo(geodesic(A2, B2, 1), B2);
  });

  it("preserves the determinant at the midpoint when endpoints share one", () => {
    const mid = geodesic(A, B, 0.5);
    expect(determinant(mid)).toBeCloseTo(Math.sqrt(determinant(A) * determinant(B)));
  });

  it("the Euclidean midpoint swells past the geodesic one", () => {
    const euclidean = euclideanInterpolate(A, B, 0.5);
    expect(determinant(euclidean)).toBeGreaterThan(determinant(geodesic(A, B, 0.5)));
  });

  it("ROTATES the ellipse when the endpoints do not commute", () => {
    // The single thing no figure in the current site or notebook ever shows.
    const startAngle = principalAngle(A2);
    const endAngle = principalAngle(B2);
    const midAngle = principalAngle(geodesic(A2, B2, 0.5));
    expect(Math.abs(midAngle - startAngle)).toBeGreaterThan(1e-3);
    expect(Math.abs(midAngle - endAngle)).toBeGreaterThan(1e-3);
  });
});

describe("riemannianMean", () => {
  it("returns the single input unchanged", () => {
    closeTo(riemannianMean([A2]), A2);
  });

  it("equals the geodesic midpoint for two matrices", () => {
    closeTo(riemannianMean([A2, B2]), geodesic(A2, B2, 0.5), 6);
  });

  it("beats the arithmetic mean at minimising total squared distance", () => {
    const trials: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const riemannian = totalSquaredDistance(riemannianMean(trials), trials);
    const arithmetic = totalSquaredDistance(arithmeticMean(trials), trials);
    expect(riemannian).toBeLessThan(arithmetic);
  });
});

describe("tangentVector", () => {
  it("is an isometry: its length equals the Riemannian distance", () => {
    // This is what the sqrt(2) off-diagonal weight is FOR.
    const v = tangentVector(A2, B2);
    expect(Math.hypot(...v)).toBeCloseTo(distance(A2, B2));
  });

  it("is zero at the reference point", () => {
    tangentVector(A2, A2).forEach((component) => {
      expect(component).toBeCloseTo(0);
    });
  });

});

describe("tangentDistortion — a measured number, not a modelled one", () => {
  it("places the ring at exactly the requested geodesic radius", () => {
    for (const radius of [0.25, 1, 1.5]) {
      for (const m of tangentRing(IDENTITY, radius, 5)) {
        expect(distance(IDENTITY, m)).toBeCloseTo(radius, 9);
      }
    }
  });

  it("vanishes as the neighbourhood shrinks", () => {
    expect(tangentDistortion(IDENTITY, 0.01, 5)).toBeLessThan(1e-4);
  });

  it("grows monotonically with the neighbourhood", () => {
    const radii = [0.25, 0.5, 0.75, 1, 1.25, 1.5];
    const values = radii.map((r) => tangentDistortion(IDENTITY, r, 5));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it("is never negative — non-positive curvature means the flat copy UNDER-states distance", () => {
    for (const radius of [0.25, 0.5, 1, 1.5]) {
      expect(tangentDistortion(IDENTITY, radius, 5)).toBeGreaterThanOrEqual(0);
    }
  });

  it("does not depend on where in the manifold you measure it", () => {
    // Congruence invariance again: the geometry looks the same from every point.
    const moved = congruence([1.2, 0.7, -0.4, 0.9], IDENTITY);
    expect(tangentDistortion(moved, 1, 5)).toBeCloseTo(
      tangentDistortion(IDENTITY, 1, 5),
      6,
    );
  });
});

describe("recentre — the transfer-learning move", () => {
  it("sends a session's own mean to the identity", () => {
    const session: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const mean = riemannianMean(session);
    closeTo(recentre(mean, mean), IDENTITY, 6);
  });

  it("preserves within-session structure exactly, because it is an isometry", () => {
    // This is the half of the claim that makes recentring free: the between-session
    // shift is cancelled, and nothing inside the session is distorted.
    const session: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const mean = riemannianMean(session);
    const before = distance(session[0], session[1]);
    const after = distance(recentre(mean, session[0]), recentre(mean, session[1]));
    expect(after).toBeCloseTo(before);
  });

  it("makes a drifted session geometrically identical to the original", () => {
    // Session B is session A seen through a different amplifier / reference.
    // After each is recentred on its own mean, every internal distance matches:
    // the between-session shift is gone and nothing within either was damaged.
    const session: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const drift: Mat2 = [1.4, 0.5, -0.3, 1.1];
    const shifted = session.map((c) => congruence(drift, c));

    const alignedA = session.map((c) => recentre(riemannianMean(session), c));
    const alignedB = shifted.map((c) => recentre(riemannianMean(shifted), c));

    for (let i = 0; i < session.length; i += 1) {
      for (let j = i + 1; j < session.length; j += 1) {
        expect(distance(alignedB[i], alignedB[j])).toBeCloseTo(
          distance(alignedA[i], alignedA[j]),
          6,
        );
      }
    }
  });

  it("leaves a residual rotation — which is why RPA adds a rotation step", () => {
    // Recentring pins both sessions' means to the identity, but two whiteners of
    // the same matrix differ by an orthogonal factor, so the clouds still differ
    // by a rotation. Worth teaching: recentring is most of the job, not all of it.
    const session: Sym2[] = [A2, B2, [1.6, 0.3, 2.2]];
    const drift: Mat2 = [1.4, 0.5, -0.3, 1.1];
    const shifted = session.map((c) => congruence(drift, c));

    const a = recentre(riemannianMean(session), session[0]);
    const b = recentre(riemannianMean(shifted), shifted[0]);

    // Same eigenvalues (so same shape), different orientation.
    expect(eigen(b).values[0]).toBeCloseTo(eigen(a).values[0], 6);
    expect(eigen(b).values[1]).toBeCloseTo(eigen(a).values[1], 6);
    expect(Math.abs(principalAngle(b) - principalAngle(a))).toBeGreaterThan(1e-3);
  });
});
