import { describe, expect, it } from "vitest";
import {
  arithmeticMean,
  determinant,
  expMapCoordinates,
  geometricMean,
  interpolateEntries,
  interpolateGeometry,
  logMapCoordinates,
  riemannianDistance,
} from "./geometry";

describe("diagonal covariance interpolation", () => {
  const start: [number, number] = [0.25, 4];
  const end: [number, number] = [4, 0.25];

  it("shows swelling for entry-by-entry interpolation", () => {
    const midpoint = interpolateEntries(start, end, 0.5);
    expect(determinant(midpoint)).toBeCloseTo(4.515625);
    expect(determinant(midpoint)).toBeGreaterThan(determinant(start));
    expect(midpoint[0]).toBeGreaterThan(0);
    expect(midpoint[1]).toBeGreaterThan(0);
  });

  it("preserves determinant along the geometry-aware path", () => {
    const midpoint = interpolateGeometry(start, end, 0.5);
    expect(midpoint).toEqual([1, 1]);
    expect(determinant(midpoint)).toBeCloseTo(1);
  });

  it("returns the endpoints at zero and one", () => {
    expect(interpolateGeometry(start, end, 0)).toEqual(start);
    expect(interpolateGeometry(start, end, 1)).toEqual(end);
  });
});

describe("diagonal SPD geometry", () => {
  const matrices: [number, number][] = [
    [0.5, 4],
    [1, 2],
    [2, 1],
  ];

  it("computes arithmetic and geometry-aware means", () => {
    expect(arithmeticMean(matrices)).toEqual([3.5 / 3, 7 / 3]);
    expect(geometricMean(matrices)).toEqual([1, 2]);
  });

  it("maps to log coordinates and back", () => {
    const matrix: [number, number] = [2.5, 0.4];
    const reference: [number, number] = [1, 1];
    const coordinates = logMapCoordinates(matrix, reference);
    const reconstructed = expMapCoordinates(coordinates, reference);

    expect(reconstructed[0]).toBeCloseTo(matrix[0]);
    expect(reconstructed[1]).toBeCloseTo(matrix[1]);
  });

  it("has symmetric distance and zero self-distance", () => {
    const first: [number, number] = [0.5, 3];
    const second: [number, number] = [2, 0.75];

    expect(riemannianDistance(first, second)).toBeCloseTo(
      riemannianDistance(second, first),
    );
    expect(riemannianDistance(first, first)).toBeCloseTo(0);
  });

  it("gives the geometric mean the lowest squared Riemannian-distance objective", () => {
    const arithmetic = arithmeticMean(matrices);
    const geometry = geometricMean(matrices);
    const objective = (center: [number, number]) =>
      matrices.reduce(
        (sum, matrix) => sum + riemannianDistance(center, matrix) ** 2,
        0,
      );

    expect(objective(geometry)).toBeLessThan(objective(arithmetic));
  });
});
