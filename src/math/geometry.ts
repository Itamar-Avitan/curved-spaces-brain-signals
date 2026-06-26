export type DiagonalMatrix2 = [number, number];

export function interpolateEntries(
  start: DiagonalMatrix2,
  end: DiagonalMatrix2,
  position: number,
): DiagonalMatrix2 {
  const t = Math.max(0, Math.min(1, position));
  return [
    (1 - t) * start[0] + t * end[0],
    (1 - t) * start[1] + t * end[1],
  ];
}

export function interpolateGeometry(
  start: DiagonalMatrix2,
  end: DiagonalMatrix2,
  position: number,
): DiagonalMatrix2 {
  const t = Math.max(0, Math.min(1, position));
  return [
    start[0] ** (1 - t) * end[0] ** t,
    start[1] ** (1 - t) * end[1] ** t,
  ];
}

export function determinant(matrix: DiagonalMatrix2): number {
  return matrix[0] * matrix[1];
}

export function arithmeticMean(
  matrices: DiagonalMatrix2[],
): DiagonalMatrix2 {
  if (matrices.length === 0) {
    throw new Error("At least one matrix is required.");
  }

  const totals = matrices.reduce(
    (sum, matrix) =>
      [sum[0] + matrix[0], sum[1] + matrix[1]] as DiagonalMatrix2,
    [0, 0] as DiagonalMatrix2,
  );

  return [totals[0] / matrices.length, totals[1] / matrices.length];
}

export function geometricMean(
  matrices: DiagonalMatrix2[],
): DiagonalMatrix2 {
  if (matrices.length === 0) {
    throw new Error("At least one matrix is required.");
  }

  const logTotals = matrices.reduce(
    (sum, matrix) =>
      [
        sum[0] + Math.log(matrix[0]),
        sum[1] + Math.log(matrix[1]),
      ] as DiagonalMatrix2,
    [0, 0] as DiagonalMatrix2,
  );

  return [
    Math.exp(logTotals[0] / matrices.length),
    Math.exp(logTotals[1] / matrices.length),
  ];
}

export function logMapCoordinates(
  matrix: DiagonalMatrix2,
  reference: DiagonalMatrix2,
): DiagonalMatrix2 {
  return [
    Math.log(matrix[0] / reference[0]),
    Math.log(matrix[1] / reference[1]),
  ];
}

export function expMapCoordinates(
  coordinates: DiagonalMatrix2,
  reference: DiagonalMatrix2,
): DiagonalMatrix2 {
  return [
    reference[0] * Math.exp(coordinates[0]),
    reference[1] * Math.exp(coordinates[1]),
  ];
}

export function riemannianDistance(
  first: DiagonalMatrix2,
  second: DiagonalMatrix2,
): number {
  const coordinates = logMapCoordinates(first, second);
  return Math.hypot(coordinates[0], coordinates[1]);
}
