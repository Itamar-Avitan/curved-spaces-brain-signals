import { describe, expect, it } from "vitest";
import {
  ARITHMETIC_BOUNDARY,
  GEOMETRIC_BOUNDARY,
  MOVE_POWER,
  REST_POWER,
  bandTrace,
  classify,
  inDisagreementZone,
  trialPower,
} from "./power-line-model";

describe("one-electrode power model", () => {
  it("interpolates power geometrically between the class means", () => {
    expect(trialPower(0)).toBeCloseTo(REST_POWER, 6);
    expect(trialPower(1)).toBeCloseTo(MOVE_POWER, 6);
    // midpoint movement lands on the geometric mean, not the arithmetic one
    expect(trialPower(0.5)).toBeCloseTo(Math.sqrt(REST_POWER * MOVE_POWER), 6);
  });

  it("scales trace amplitude with the square root of power", () => {
    const restRms = rms(bandTrace(0));
    const moveRms = rms(bandTrace(1));
    expect(restRms).toBeGreaterThan(moveRms);
    expect(restRms / moveRms).toBeCloseTo(
      Math.sqrt(REST_POWER / MOVE_POWER),
      1,
    );
  });

  it("has distinct arithmetic and geometric decision boundaries", () => {
    expect(GEOMETRIC_BOUNDARY).toBeLessThan(ARITHMETIC_BOUNDARY);
  });

  it("flips the label inside the disagreement zone", () => {
    const power = (ARITHMETIC_BOUNDARY + GEOMETRIC_BOUNDARY) / 2;
    expect(inDisagreementZone(power)).toBe(true);
    // straight-line distance is biased toward the low-power class (move);
    // the ratio-correct log distance fairly calls this mid trial rest
    expect(classify(power, false)).toBe("move");
    expect(classify(power, true)).toBe("rest");
  });
});

function rms(values: number[]): number {
  const sumSquares = values.reduce((acc, v) => acc + v * v, 0);
  return Math.sqrt(sumSquares / values.length);
}
