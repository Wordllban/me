// Small 2D helpers for the ivy vine. Angles are degrees, clockwise from up.

export type Vec = readonly [number, number];

export interface Sample {
  p: Vec;
  /** arc length from the stem base */
  s: number;
  /** unit tangent, pointing toward the tip */
  t: Vec;
  /** unit normal */
  n: Vec;
}

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1];
export const length = (a: Vec): number => Math.hypot(a[0], a[1]);
export const lerp = (a: Vec, b: Vec, t: number): Vec => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

export function unit(a: Vec): Vec {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l];
}

export function heading(deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), -Math.cos(r)];
}

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/** Seeded PRNG (mulberry32), so the vine grows the same way every time. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const jitter = (r: () => number, amount: number): number =>
  (r() * 2 - 1) * amount;

const round = (v: number): number => Math.round(v * 100) / 100;
export const point = (p: Vec): string => `${round(p[0])} ${round(p[1])}`;

export function polyline(pts: readonly Vec[], close = false): string {
  return `M${pts.map(point).join("L")}${close ? "Z" : ""}`;
}

/** Catmull-Rom spline through pts, `per` samples per segment. */
export function catmull(pts: readonly Vec[], per: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      // Catmull-Rom basis weights for p0..p3
      const w = [
        -t3 + 2 * t2 - t,
        3 * t3 - 5 * t2 + 2,
        -3 * t3 + 4 * t2 + t,
        t3 - t2,
      ];
      out.push([
        (w[0] * p0[0] + w[1] * p1[0] + w[2] * p2[0] + w[3] * p3[0]) / 2,
        (w[0] * p0[1] + w[1] * p1[1] + w[2] * p2[1] + w[3] * p3[1]) / 2,
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Arc-length samples with tangents and normals along a polyline. */
export function sampleLine(pts: readonly Vec[]): Sample[] {
  let acc = 0;
  return pts.map((p, i) => {
    if (i > 0) acc += length(sub(p, pts[i - 1]));
    const t = unit(
      sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])
    );
    return { p, s: acc, t, n: [-t[1], t[0]] as Vec };
  });
}

export function nearestIndex(samples: readonly Sample[], target: Vec): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  samples.forEach((q, i) => {
    const d = length(sub(q.p, target));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

/** Cubic Bezier sampled into n + 1 points. */
export function cubic(ctrl: readonly [Vec, Vec, Vec, Vec], n: number): Vec[] {
  const [a, b, c, d] = ctrl;
  const out: Vec[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const m = 1 - t;
    const w = [m * m * m, 3 * m * m * t, 3 * m * t * t, t * t * t];
    out.push([
      w[0] * a[0] + w[1] * b[0] + w[2] * c[0] + w[3] * d[0],
      w[0] * a[1] + w[1] * b[1] + w[2] * c[1] + w[3] * d[1],
    ]);
  }
  return out;
}

/** Closed outline of a strip that tapers from w0 to w1 along pts. */
export function taper(pts: readonly Vec[], w0: number, w1: number): string {
  const left: Vec[] = [];
  const right: Vec[] = [];
  pts.forEach((p, i) => {
    const t = i / (pts.length - 1);
    const d = unit(
      sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])
    );
    const half = (w0 + (w1 - w0) * t) / 2;
    left.push(add(p, [-d[1] * half, d[0] * half]));
    right.push(sub(p, [-d[1] * half, d[0] * half]));
  });
  return polyline(left.concat(right.reverse()), true);
}
