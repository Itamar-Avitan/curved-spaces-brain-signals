export type Matrix2 = [[number, number], [number, number]];

export interface CovarianceModel {
  covariance: Matrix2;
  eigenvalues: [number, number];
  angle: number;
}

export function covarianceFromParameters(
  varianceX: number,
  varianceY: number,
  correlation: number,
): CovarianceModel {
  const boundedCorrelation = Math.max(-0.98, Math.min(0.98, correlation));
  const covarianceXY = boundedCorrelation * Math.sqrt(varianceX * varianceY);
  const matrix: Matrix2 = [
    [varianceX, covarianceXY],
    [covarianceXY, varianceY],
  ];

  const trace = varianceX + varianceY;
  const determinant = varianceX * varianceY - covarianceXY ** 2;
  const discriminant = Math.sqrt(Math.max(0, trace ** 2 - 4 * determinant));
  const eigenvalues: [number, number] = [
    (trace + discriminant) / 2,
    (trace - discriminant) / 2,
  ];
  const angle = 0.5 * Math.atan2(2 * covarianceXY, varianceX - varianceY);

  return { covariance: matrix, eigenvalues, angle };
}

export function syntheticSignals(
  correlation: number,
  sampleCount = 120,
): { x: number[]; y: number[] } {
  const boundedCorrelation = Math.max(-0.98, Math.min(0.98, correlation));
  const residualScale = Math.sqrt(1 - boundedCorrelation ** 2);
  const x: number[] = [];
  const y: number[] = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const t = (index / sampleCount) * Math.PI * 8;
    const base =
      Math.sin(t) * 0.72 +
      Math.sin(t * 2.15 + 0.4) * 0.22 +
      Math.cos(t * 0.37) * 0.12;
    const independent =
      Math.sin(t * 1.41 + 1.2) * 0.62 +
      Math.cos(t * 2.63 - 0.3) * 0.25;
    x.push(base);
    y.push(boundedCorrelation * base + residualScale * independent);
  }

  return { x, y };
}
