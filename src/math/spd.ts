/**
 * Symmetric positive-definite 2x2 matrices under the affine-invariant Riemannian
 * metric.
 *
 * The lesson's earlier `geometry.ts` models only DIAGONAL matrices. That submanifold
 * is flat — under the affine-invariant metric it is isometric to the plane via
 * (a, b) -> (log a, log b) — so nothing built on it can show curvature, and nothing
 * built on it can distinguish this geometry from taking logarithms before averaging.
 * Curvature and congruence invariance both live in the off-diagonal direction, which
 * is also where the EEG signal lives. This module models the full 2x2 case.
 *
 * Convention: the log map is the WHITENED form, log(P^-1/2 Q P^-1/2), matching
 * pyRiemann's `tangent_space`. The alternative full form
 * P^1/2 log(P^-1/2 Q P^-1/2) P^1/2 differs by a congruence; do not mix them.
 */

/** Row-major 2x2, [[m0, m1], [m2, m3]]. Need not be symmetric. */
export type Mat2 = readonly [number, number, number, number];

/** Symmetric 2x2 stored as [xx, xy, yy] -> [[xx, xy], [xy, yy]]. */
export type Sym2 = readonly [number, number, number];

export interface Eigen2 {
  /** Eigenvalues, descending. */
  values: readonly [number, number];
  /** Rotation of the leading eigenvector from the x-axis, in radians. */
  angle: number;
}

export function eigen(s: Sym2): Eigen2 {
  const [xx, xy, yy] = s;
  const halfTrace = (xx + yy) / 2;
  const spread = Math.hypot((xx - yy) / 2, xy);
  return {
    values: [halfTrace + spread, halfTrace - spread],
    angle: 0.5 * Math.atan2(2 * xy, xx - yy),
  };
}

export function fromEigen(
  values: readonly [number, number],
  angle: number,
): Sym2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [l1, l2] = values;
  return [
    l1 * c * c + l2 * s * s,
    (l1 - l2) * c * s,
    l1 * s * s + l2 * c * c,
  ];
}

/** Apply a scalar function to the eigenvalues, keeping the eigenvectors. */
function mapEigen(s: Sym2, f: (value: number) => number): Sym2 {
  const { values, angle } = eigen(s);
  return fromEigen([f(values[0]), f(values[1])], angle);
}

export const sqrtm = (s: Sym2): Sym2 => mapEigen(s, Math.sqrt);
export const invSqrtm = (s: Sym2): Sym2 => mapEigen(s, (v) => 1 / Math.sqrt(v));
export const logm = (s: Sym2): Sym2 => mapEigen(s, Math.log);
export const expm = (s: Sym2): Sym2 => mapEigen(s, Math.exp);
export const powm = (s: Sym2, t: number): Sym2 => mapEigen(s, (v) => v ** t);
export const inverse = (s: Sym2): Sym2 => mapEigen(s, (v) => 1 / v);

export function determinant(s: Sym2): number {
  return s[0] * s[2] - s[1] * s[1];
}

export function trace(s: Sym2): number {
  return s[0] + s[2];
}

export function principalAngle(s: Sym2): number {
  return eigen(s).angle;
}

export function isSpd(s: Sym2, tolerance = 1e-12): boolean {
  return s[0] > tolerance && determinant(s) > tolerance;
}

/**
 * Congruence: W S Wᵀ.
 *
 * Every EEG nuisance factor takes this form — volume conduction, the lead field,
 * electrode gain, re-referencing, whitening, spatial filtering, session drift. The
 * affine-invariant distance is defined to be blind to it.
 */
export function congruence(w: Mat2, s: Sym2): Sym2 {
  const [w0, w1, w2, w3] = w;
  const [xx, xy, yy] = s;
  // (W S) Wᵀ, expanded.
  const a = w0 * xx + w1 * xy;
  const b = w0 * xy + w1 * yy;
  const c = w2 * xx + w3 * xy;
  const d = w2 * xy + w3 * yy;
  return [a * w0 + b * w1, a * w2 + b * w3, c * w2 + d * w3];
}

/** Whiten `s` by `reference`: reference^-1/2 · s · reference^-1/2. */
export function recentre(reference: Sym2, s: Sym2): Sym2 {
  const half = invSqrtm(reference);
  return congruence([half[0], half[1], half[1], half[2]], s);
}

/**
 * Affine-invariant Riemannian distance:
 *   delta(P, Q) = ||log(P^-1/2 Q P^-1/2)||_F = sqrt( sum_i log^2 lambda_i )
 * where lambda_i are the eigenvalues of P^-1 Q.
 *
 * Note the symmetrised form. ||log(P^-1 Q)||_F is a common and wrong shortcut:
 * P^-1 Q is generally not symmetric.
 */
export function distance(p: Sym2, q: Sym2): number {
  const { values } = eigen(recentre(p, q));
  return Math.hypot(Math.log(values[0]), Math.log(values[1]));
}

/** Straight-line interpolation of the entries — the ruler that swells. */
export function euclideanInterpolate(p: Sym2, q: Sym2, t: number): Sym2 {
  const u = Math.max(0, Math.min(1, t));
  return [
    p[0] + (q[0] - p[0]) * u,
    p[1] + (q[1] - p[1]) * u,
    p[2] + (q[2] - p[2]) * u,
  ];
}

/**
 * Geodesic: P #_t Q = P^1/2 (P^-1/2 Q P^-1/2)^t P^1/2.
 *
 * When P and Q do not commute this path ROTATES the ellipse rather than only
 * rescaling its axes — the visible signature of curvature.
 */
export function geodesic(p: Sym2, q: Sym2, t: number): Sym2 {
  const u = Math.max(0, Math.min(1, t));
  const half = sqrtm(p);
  const scaled = powm(recentre(p, q), u);
  return congruence([half[0], half[1], half[1], half[2]], scaled);
}

/** The log map, whitened convention: log(P^-1/2 Q P^-1/2). */
export function logMap(reference: Sym2, s: Sym2): Sym2 {
  return logm(recentre(reference, s));
}

/** Inverse of {@link logMap}. */
export function expMap(reference: Sym2, tangent: Sym2): Sym2 {
  const half = sqrtm(reference);
  return congruence([half[0], half[1], half[1], half[2]], expm(tangent));
}

/**
 * Tangent-space coordinates: the upper triangle of the log map, with the
 * off-diagonal scaled by sqrt(2).
 *
 * The sqrt(2) is what makes this an isometry — the Euclidean length of the returned
 * vector equals the Riemannian distance. Without it the off-diagonals, which carry
 * the channel-to-channel coupling the BCI signal actually lives in, are silently
 * down-weighted by 1/sqrt(2).
 */
export function tangentVector(
  reference: Sym2,
  s: Sym2,
): readonly [number, number, number] {
  const [xx, xy, yy] = logMap(reference, s);
  return [xx, Math.SQRT2 * xy, yy];
}

export function arithmeticMean(matrices: readonly Sym2[]): Sym2 {
  if (matrices.length === 0) {
    throw new Error("At least one matrix is required.");
  }
  const total = matrices.reduce<[number, number, number]>(
    (sum, m) => [sum[0] + m[0], sum[1] + m[1], sum[2] + m[2]],
    [0, 0, 0],
  );
  const n = matrices.length;
  return [total[0] / n, total[1] / n, total[2] / n];
}

/**
 * Riemannian (Frechet) mean: the matrix minimising the total squared Riemannian
 * distance to the inputs.
 *
 * Computed by the standard fixed point — log-map everything to the tangent space at
 * the current estimate, average there, exp-map back — which converges because the
 * manifold has non-positive curvature, so the minimiser is unique.
 */
export function riemannianMean(
  matrices: readonly Sym2[],
  { tolerance = 1e-12, maxIterations = 60 } = {},
): Sym2 {
  if (matrices.length === 0) {
    throw new Error("At least one matrix is required.");
  }
  if (matrices.length === 1) {
    return matrices[0];
  }

  let estimate = arithmeticMean(matrices);
  for (let step = 0; step < maxIterations; step += 1) {
    const tangentMean = arithmeticMean(
      matrices.map((m) => logMap(estimate, m)),
    );
    estimate = expMap(estimate, tangentMean);
    if (Math.hypot(tangentMean[0], Math.SQRT2 * tangentMean[1], tangentMean[2]) < tolerance) {
      break;
    }
  }
  return estimate;
}

export function totalSquaredDistance(
  centre: Sym2,
  matrices: readonly Sym2[],
): number {
  return matrices.reduce((sum, m) => sum + distance(centre, m) ** 2, 0);
}

/**
 * Two orthonormal tangent directions spanning a plane of NEGATIVE curvature.
 *
 * Sym(2) splits into the scaling direction (the identity, which is flat — it is the
 * whole story on the diagonal submanifold) and these two traceless shear directions,
 * which do not commute. Curvature lives here.
 */
const SHEAR_A: Sym2 = [Math.SQRT1_2, 0, -Math.SQRT1_2];
const SHEAR_B: Sym2 = [0, Math.SQRT1_2, 0];

/** `count` matrices spaced evenly on a geodesic circle of the given radius. */
export function tangentRing(
  reference: Sym2,
  radius: number,
  count: number,
): Sym2[] {
  return Array.from({ length: count }, (_, index) => {
    const theta = (index * 2 * Math.PI) / count;
    const c = radius * Math.cos(theta);
    const s = radius * Math.sin(theta);
    const direction: Sym2 = [
      c * SHEAR_A[0] + s * SHEAR_B[0],
      c * SHEAR_A[1] + s * SHEAR_B[1],
      c * SHEAR_A[2] + s * SHEAR_B[2],
    ];
    return expMap(reference, direction);
  });
}

/**
 * How much the flat tangent copy misrepresents the neighbourhood, as a fraction.
 *
 * The log map is exact along rays from the reference but not between two points
 * that both sit away from it. Because the manifold has non-positive curvature the
 * true distance is never shorter than its flattened image, so the flat copy always
 * UNDER-states separation, and does so more the further out you go.
 *
 * Returns the mean relative shortfall over all pairs on a ring of the given radius.
 */
export function tangentDistortion(
  reference: Sym2,
  radius: number,
  count = 5,
): number {
  const ring = tangentRing(reference, radius, count);
  const vectors = ring.map((m) => tangentVector(reference, m));

  let total = 0;
  let pairs = 0;
  for (let i = 0; i < ring.length; i += 1) {
    for (let j = i + 1; j < ring.length; j += 1) {
      const curved = distance(ring[i], ring[j]);
      const flat = Math.hypot(
        vectors[i][0] - vectors[j][0],
        vectors[i][1] - vectors[j][1],
        vectors[i][2] - vectors[j][2],
      );
      if (curved > 1e-12) {
        total += (curved - flat) / curved;
        pairs += 1;
      }
    }
  }
  return pairs === 0 ? 0 : total / pairs;
}
