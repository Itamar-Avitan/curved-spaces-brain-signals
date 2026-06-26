import { describe, expect, it } from "vitest";
import { signalCovarianceFrame } from "./signal-covariance-model";

describe("signalCovarianceFrame", () => {
  it("computes the covariance matrix from the visible signal prefix", () => {
    const frame = signalCovarianceFrame(0.5, 0.72, 120);
    const x = frame.signals.x.slice(0, frame.visibleCount);
    const y = frame.signals.y.slice(0, frame.visibleCount);
    const meanX = x.reduce((sum, value) => sum + value, 0) / x.length;
    const meanY = y.reduce((sum, value) => sum + value, 0) / y.length;
    const covarianceXY =
      x.reduce(
        (sum, value, index) =>
          sum + (value - meanX) * (y[index] - meanY),
        0,
      ) /
      (x.length - 1);

    expect(frame.visibleCount).toBe(60);
    expect(frame.covariance[0][1]).toBeCloseTo(covarianceXY, 10);
    expect(frame.covariance[1][0]).toBeCloseTo(covarianceXY, 10);
  });

  it("clamps scrub progress and returns a positive-definite matrix", () => {
    const frame = signalCovarianceFrame(2, -0.55, 80);
    const determinant =
      frame.covariance[0][0] * frame.covariance[1][1] -
      frame.covariance[0][1] ** 2;

    expect(frame.visibleCount).toBe(80);
    expect(determinant).toBeGreaterThan(0);
    expect(frame.eigenvalues[1]).toBeGreaterThan(0);
  });
});
