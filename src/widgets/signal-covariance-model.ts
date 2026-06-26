import {
  covarianceFromParameters,
  syntheticSignals,
  type CovarianceModel,
} from "../math/covariance";

export interface SignalCovarianceFrame extends CovarianceModel {
  signals: { x: number[]; y: number[] };
  visibleCount: number;
  varianceX: number;
  varianceY: number;
  correlation: number;
}

export function signalCovarianceFrame(
  progress: number,
  correlation = 0.72,
  sampleCount = 160,
): SignalCovarianceFrame {
  const signals = syntheticSignals(correlation, sampleCount);
  const boundedProgress = Math.max(0.05, Math.min(1, progress));
  const visibleCount = Math.max(
    8,
    Math.min(sampleCount, Math.round(sampleCount * boundedProgress)),
  );
  const x = signals.x.slice(0, visibleCount);
  const y = signals.y.slice(0, visibleCount);
  const meanX = x.reduce((sum, value) => sum + value, 0) / visibleCount;
  const meanY = y.reduce((sum, value) => sum + value, 0) / visibleCount;
  const denominator = Math.max(1, visibleCount - 1);
  const varianceX =
    x.reduce((sum, value) => sum + (value - meanX) ** 2, 0) / denominator;
  const varianceY =
    y.reduce((sum, value) => sum + (value - meanY) ** 2, 0) / denominator;
  const covarianceXY =
    x.reduce(
      (sum, value, index) =>
        sum + (value - meanX) * (y[index] - meanY),
      0,
    ) / denominator;
  const correlationEstimate =
    covarianceXY / Math.sqrt(Math.max(Number.EPSILON, varianceX * varianceY));
  const model = covarianceFromParameters(
    varianceX,
    varianceY,
    correlationEstimate,
  );

  return {
    ...model,
    signals,
    visibleCount,
    varianceX,
    varianceY,
    correlation: correlationEstimate,
  };
}
