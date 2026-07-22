/**
 * CSS-style cubic-bezier(x1, y1, x2, y2) with inverse-X sampling.
 * Given progress x ∈ [0, 1], solve for t where Bx(t) = x, then return By(t).
 */

export type CubicBezierPoints = readonly [number, number, number, number];

/** Material-ish ease: soft start, then catch-up — good for stream backlog. */
export const DEFAULT_STREAM_BEZIER: CubicBezierPoints = [0.22, 0.61, 0.36, 1];

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 10;

function A(a1: number, a2: number): number {
  return 1 - 3 * a2 + 3 * a1;
}

function B(a1: number, a2: number): number {
  return 3 * a2 - 6 * a1;
}

function C(a1: number): number {
  return 3 * a1;
}

/** Bezier component: ((A*t + B)*t + C)*t */
function calcBezier(t: number, a1: number, a2: number): number {
  return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
}

function getSlope(t: number, a1: number, a2: number): number {
  return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
}

function binarySubdivide(
  x: number,
  a: number,
  b: number,
  x1: number,
  x2: number,
): number {
  let currentX: number;
  let currentT: number;
  let i = 0;
  do {
    currentT = a + (b - a) / 2;
    currentX = calcBezier(currentT, x1, x2) - x;
    if (currentX > 0) {
      b = currentT;
    } else {
      a = currentT;
    }
  } while (
    Math.abs(currentX) > SUBDIVISION_PRECISION &&
    ++i < SUBDIVISION_MAX_ITERATIONS
  );
  return currentT;
}

function newtonRaphsonIterate(
  x: number,
  guessT: number,
  x1: number,
  x2: number,
): number {
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const slope = getSlope(guessT, x1, x2);
    if (slope === 0) return guessT;
    const currentX = calcBezier(guessT, x1, x2) - x;
    guessT -= currentX / slope;
  }
  return guessT;
}

/**
 * Sample CSS cubic-bezier at x ∈ [0, 1] via inverse-X (Newton + binary fallback).
 * Degenerate linear control points return x unchanged.
 */
export function sampleCubicBezier(
  x: number,
  points: CubicBezierPoints = DEFAULT_STREAM_BEZIER,
): number {
  const [x1, y1, x2, y2] = points;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (x1 === y1 && x2 === y2) return x;

  let guessT = x;
  const initialSlope = getSlope(guessT, x1, x2);
  if (initialSlope >= NEWTON_MIN_SLOPE) {
    guessT = newtonRaphsonIterate(x, guessT, x1, x2);
  } else if (initialSlope === 0) {
    guessT = x;
  } else {
    guessT = binarySubdivide(x, 0, 1, x1, x2);
  }

  return calcBezier(guessT, y1, y2);
}

/** Map backlog ratio through bezier into [min, max] multiplier. */
export function easingMultiplier(
  backlogRatio: number,
  points: CubicBezierPoints,
  minMultiplier: number,
  maxMultiplier: number,
): number {
  const t = Math.max(0, Math.min(1, backlogRatio));
  const eased = sampleCubicBezier(t, points);
  return minMultiplier + eased * (maxMultiplier - minMultiplier);
}
