// Where the ivy grows: a woody stem climbing the rail past every chapter row,
// petioles to the chapter leaves, wall-side leaves, side shoots and a young tip.
// Everything is placed relative to the measured rows, so any rail height works.

import type { IvyVariant } from "../../data/ivy";
import { clamp, jitter, rng, type Vec } from "./math";

export interface Anchor {
  /** petiole junction of the chapter leaf */
  junction: Vec;
  /** vertical centre of the chapter row */
  row: number;
  /** direction the petiole leaves the junction */
  petiole: number;
  /** leaf length in px */
  size: number;
}

export interface Frame {
  width: number;
  height: number;
  /** nothing may grow above this y (bottom of the intro text) */
  ceiling: number;
}

export interface Stem {
  points: Vec[];
  w0: number;
  w1: number;
  main: boolean;
}

export interface Twig {
  stem: number;
  /** point on the stem the petiole grows from */
  node: Vec;
  junction: Vec;
  petiole: number;
  size: number;
  /** behind the stem, against the wall */
  back: boolean;
  /** drawn leaf; chapter leaves live in the nav markup instead */
  leaf?: { variant: IvyVariant; rotate: number };
}

export interface VineLayout {
  stems: Stem[];
  twigs: Twig[];
}

interface Ctx {
  r: () => number;
  x0: number;
  rows: number[];
  frame: Frame;
  k: number;
}

const WALL_LEAVES: IvyVariant[] = ["w1", "w2", "wi1", "w3", "b2", "w4"];
const SHOOT_LEAVES: IvyVariant[] = ["m2", "c9", "c10", "m1"];
const CURL: Vec[] = [
  [9, -16],
  [15, -34],
  [21, -48],
  [27, -57],
  [34, -62],
];

function curl(c: Ctx): Vec[] {
  const room = c.rows[0] - c.frame.ceiling - 6;
  const squash = clamp(room / 62, 0.35, 1);
  return CURL.map(([dx, dy]) => [c.x0 + dx, c.rows[0] + dy * squash]);
}

function mainStem(c: Ctx, tip: Vec[]): Stem {
  const { r, x0, frame } = c;
  const points: Vec[] = [[x0 - 19, frame.height + 12]];
  const phase = r() * Math.PI * 2;
  const stop = tip[0][1] + 18;
  for (let y = frame.height - 24; y > stop; y -= 25 + jitter(r, 2)) {
    const rise = Math.min(1, (frame.height - y) / 110);
    const sway = 7 * Math.sin((2 * Math.PI * y) / 148 + phase) + jitter(r, 1.2);
    points.push([x0 - 19 * (1 - rise) + sway * rise, y]);
  }
  return { points: points.concat(tip), w0: 11, w1: 1.5, main: true };
}

/** x of the main stem at height y (piecewise linear over its control points). */
function stemX(stem: Stem, y: number): number {
  const pts = stem.points;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    if ((a[1] - y) * (b[1] - y) <= 0) {
      const t = a[1] === b[1] ? 0 : (y - a[1]) / (b[1] - a[1]);
      return a[0] + (b[0] - a[0]) * t;
    }
  }
  return pts[0][0];
}

function chapterTwigs(anchors: Anchor[], x0: number): Twig[] {
  return anchors.map((a) => ({
    stem: 0,
    node: [x0, a.junction[1] + 12],
    junction: a.junction,
    petiole: a.petiole,
    size: a.size,
    back: false,
  }));
}

/** Rows the wall-side leaves sit on: between chapters, plus one above and below. */
function wallRows(c: Ctx): number[] {
  const { rows, frame, k } = c;
  const mids = rows.slice(1).map((y, i) => (y + rows[i]) / 2);
  const below = rows[rows.length - 1] + 78 * k;
  const above = rows[0] - 32 * k;
  const out = mids.map((y) => y + 6);
  if (below < frame.height - 30) out.push(below);
  if (above > frame.ceiling + 14) out.unshift(above);
  return out;
}

function wallTwigs(c: Ctx): Twig[] {
  const { r, x0, k, rows } = c;
  return wallRows(c).map((y, i) => {
    const small = y < rows[0];
    const yy = y + jitter(r, 3);
    return {
      stem: 0,
      node: [x0, yy + 8],
      junction: [x0 - 10 + jitter(r, 2), yy],
      petiole: 0,
      size: (small ? 15 : 26) * k * (0.9 + r() * 0.2),
      back: true,
      leaf: {
        variant: WALL_LEAVES[i % WALL_LEAVES.length],
        rotate: jitter(r, 10),
      },
    };
  });
}

function shootAt(c: Ctx, base: Vec, i: number): { stem: Stem; twigs: Twig[] } {
  const { r, k } = c;
  const at = (dx: number, dy: number): Vec => [
    base[0] + dx * k,
    base[1] + dy * k,
  ];
  const stem: Stem = {
    points: [base, at(8, -5), at(16, -12), at(24, -18), at(31, -24)],
    w0: 2.8,
    w1: 1.1,
    main: false,
  };
  const leaf: Twig = {
    stem: -1,
    node: at(13, -11),
    junction: at(20, -16),
    petiole: 0,
    size: 25 * k,
    back: false,
    leaf: {
      variant: SHOOT_LEAVES[i % SHOOT_LEAVES.length],
      rotate: jitter(r, 20),
    },
  };
  const bud: Twig = {
    stem: -1,
    node: at(30, -24),
    junction: at(34, -26),
    petiole: 0,
    size: 11 * k,
    back: false,
    leaf: { variant: "y1", rotate: 30 },
  };
  return { stem, twigs: i % 2 === 0 ? [leaf, bud] : [leaf] };
}

function sideShoots(c: Ctx, main: Stem): { stems: Stem[]; twigs: Twig[] } {
  const { rows, k, frame } = c;
  if (k < 0.82) return { stems: [], twigs: [] };
  const ys = [1, 3, 5]
    .filter((i) => i < rows.length - 1)
    .map((i) => (rows[i] + rows[i + 1]) / 2 + 14 * k);
  const last = rows[rows.length - 1] + 56 * k;
  if (last < frame.height - 40) ys.push(last);
  const stems: Stem[] = [];
  const twigs: Twig[] = [];
  ys.forEach((y, i) => {
    const shoot = shootAt(c, [stemX(main, y), y], i);
    const index = stems.length + 1;
    stems.push(shoot.stem);
    for (const t of shoot.twigs) twigs.push({ ...t, stem: index });
  });
  return { stems, twigs };
}

function tipTwigs(c: Ctx, tip: Vec[]): Twig[] {
  const { k } = c;
  const young = (
    variant: IvyVariant,
    junction: Vec,
    size: number,
    rotate: number
  ): Twig => ({
    stem: 0,
    node: [junction[0], junction[1] + 4],
    junction,
    petiole: 0,
    size: size * k,
    back: false,
    leaf: { variant, rotate },
  });
  return [
    young("y3", tip[2], 15, 0),
    young("y2", [tip[2][0] - 9, tip[3][1] - 1], 11, -70),
    young("y1", [tip[4][0], tip[4][1] - 4], 8, 0),
  ];
}

export function layoutVine(anchors: Anchor[], frame: Frame): VineLayout {
  const rows = anchors.map((a) => a.row);
  const x0 =
    anchors.reduce((sum, a) => sum + a.junction[0], 0) / anchors.length - 24;
  const span =
    rows.length > 1
      ? (rows[rows.length - 1] - rows[0]) / (rows.length - 1)
      : 85;
  const c: Ctx = { r: rng(7), x0, rows, frame, k: clamp(span / 85, 0.7, 1.1) };
  const tip = curl(c);
  const main = mainStem(c, tip);
  const shoots = sideShoots(c, main);
  return {
    stems: [main, ...shoots.stems],
    twigs: [
      ...wallTwigs(c),
      ...chapterTwigs(anchors, x0),
      ...shoots.twigs,
      ...tipTwigs(c, tip),
    ],
  };
}
