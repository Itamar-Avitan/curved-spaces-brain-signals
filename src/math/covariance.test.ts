import { describe, expect, it } from "vitest";
import { covarianceFromParameters } from "./covariance";

describe("covarianceFromParameters", () => {
  it("returns a symmetric positive-definite covariance matrix", () => {
    const model = covarianceFromParameters(1.4, 0.8, 0.65);
    const matrix = model.covariance;
    const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] ** 2;

    expect(matrix[0][1]).toBe(matrix[1][0]);
    expect(model.eigenvalues[0]).toBeGreaterThan(0);
    expect(model.eigenvalues[1]).toBeGreaterThan(0);
    expect(determinant).toBeGreaterThan(0);
  });

  it("bounds correlation to preserve positive definiteness", () => {
    const model = covarianceFromParameters(1, 1, 2);
    expect(model.covariance[0][1]).toBeCloseTo(0.98);
    expect(model.eigenvalues[1]).toBeGreaterThan(0);
  });
});
