// Turns a vine layout into SVG shapes: a woody, barked stem that greens toward
// the tip, aerial rootlets on the wall side, arcing petioles and leaf images.
// Plain paths and images only: no SVG filters, so the rail stays cheap to paint.

import { ivyLeaves, ivyScale, ivySrc } from "../../data/ivy";
import type { Stem, Twig, VineLayout } from "./layout";
import {
  add,
  catmull,
  cubic,
  dot,
  heading,
  jitter,
  length,
  lerp,
  nearestIndex,
  point,
  polyline,
  rng,
  type Sample,
  sampleLine,
  scale,
  sub,
  taper,
  unit,
  type Vec,
} from "./math";

interface PathShape {
  d: string;
  fill: string;
  stroke?: string;
  width?: number;
  opacity?: number;
  dash?: string;
}

interface ImageShape {
  href: string;
  width: number;
  height: number;
  transform: string;
}

export type Shape = PathShape | ImageShape;

export interface VineShapes {
  /** rootlets, wall leaves and the stem's cast shadow */
  back: Shape[];
  body: Shape[];
  front: Shape[];
  /** y of the stem base and tip, for the bark-to-green gradient */
  span: [number, number];
}

interface Model {
  stem: Stem;
  s: Sample[];
  width: (i: number) => number;
}

const LIGHT: Vec = unit([-0.6, -0.8]);

function model(stem: Stem, seed: number): Model {
  const s = sampleLine(catmull(stem.points, stem.main ? 10 : 6));
  const total = s[s.length - 1].s || 1;
  const phase = rng(seed)() * 6;
  const width = (i: number) => {
    const t = s[i].s / total;
    const swell =
      1 + 0.07 * Math.sin(s[i].s / 7 + phase) + 0.04 * Math.sin(s[i].s / 2.9);
    return (stem.w1 + (stem.w0 - stem.w1) * (1 - t) ** 1.7) * swell;
  };
  return { stem, s, width };
}

/** A strip along the stem: `shift` and `span` are fractions of the stem width. */
function band(m: Model, shift: number, span: number, upTo = 1): string {
  const left: Vec[] = [];
  const right: Vec[] = [];
  const last = Math.floor((m.s.length - 1) * upTo);
  for (let i = 0; i <= last; i++) {
    const q = m.s[i];
    const w = m.width(i);
    const c = add(q.p, scale(q.n, shift * w));
    left.push(add(c, scale(q.n, (span * w) / 2)));
    right.push(sub(c, scale(q.n, (span * w) / 2)));
  }
  return polyline(left.concat(right.reverse()), true);
}

function castShadow(m: Model, offset: Vec, grow: number): string {
  const left: Vec[] = [];
  const right: Vec[] = [];
  m.s.forEach((q, i) => {
    const half = m.width(i) / 2 + grow;
    left.push(add(add(q.p, scale(q.n, half)), offset));
    right.push(add(sub(q.p, scale(q.n, half)), offset));
  });
  return polyline(left.concat(right.reverse()), true);
}

/** Fuzzy tufts of fine rootlets pressed against the wall, densest on old wood. */
function rootlets(m: Model, r: () => number): PathShape[] {
  const total = m.s[m.s.length - 1].s;
  let hairs = "";
  let next = 6;
  m.s.forEach((q, i) => {
    const t = q.s / total;
    if (q.s < next || t > 0.8) return;
    next = q.s + 9 + r() * 16 + t * 20;
    if (r() > 0.85 - t * 0.5) return;
    const wall = q.n[0] < 0 ? 1 : -1;
    const count = Math.round((10 + r() * 18) * (1 - t * 0.7));
    for (let h = 0; h < count; h++) {
      const side = r() < 0.85 ? wall : -wall;
      const base = add(
        add(q.p, scale(q.n, side * m.width(i) * (0.3 + r() * 0.15))),
        scale(q.t, jitter(r, 5))
      );
      const dir = unit(
        add(
          scale(q.n, side * (0.55 + r() * 0.5)),
          scale(q.t, -0.4 + jitter(r, 0.5))
        )
      );
      const end = add(base, scale(dir, (0.8 + r() * 2.6) * (1.1 - t * 0.5)));
      const mid = add(
        lerp(base, end, 0.5),
        scale([dir[1], -dir[0]], jitter(r, 0.7))
      );
      hairs += `M${point(base)}Q${point(mid)} ${point(end)}`;
    }
  });
  return [
    { d: hairs, fill: "none", stroke: "#b9a27e", width: 0.28, opacity: 0.55 },
  ];
}

/** Round stem: dark rim, bark-to-green body, lit band, highlight, core shade, lilac rim. */
function cylinder(m: Model): PathShape[] {
  const mid = m.s[Math.floor(m.s.length / 2)];
  const lit = dot(mid.n, LIGHT) > 0 ? 1 : -1;
  const rim: PathShape = {
    d: band(m, 0, 1.18),
    fill: "#140e0a",
    opacity: 0.95,
  };
  return [
    rim,
    { d: band(m, 0, 1), fill: "url(#ivy-bark)" },
    { d: band(m, 0.16 * lit, 0.46), fill: "url(#ivy-lit)", opacity: 0.92 },
    { d: band(m, 0.3 * lit, 0.12), fill: "url(#ivy-hi)", opacity: 0.5 },
    { d: band(m, -0.3 * lit, 0.2), fill: "#1a130d", opacity: 0.45 },
    { d: band(m, -0.46 * lit, 0.07, 0.94), fill: "#a98ad8", opacity: 0.3 },
  ];
}

/** Broken bark fissures and lenticels on the lower, woody part of the stem. */
function bark(m: Model, r: () => number): PathShape[] {
  const to = Math.floor(m.s.length * 0.6);
  const out: PathShape[] = [];
  for (let lane = 0; lane < 6; lane++) {
    const shift = -0.36 + lane * 0.144;
    const pts = m.s
      .slice(0, to + 1)
      .map((q, i) =>
        add(q.p, scale(q.n, (shift + jitter(r, 0.03)) * m.width(i)))
      );
    const dash = Array.from({ length: 90 }, (_, i) =>
      (i % 2 ? 1 + r() * 5 : 1.5 + r() * 6).toFixed(2)
    );
    const dark = lane % 2 === 1;
    out.push({
      d: polyline(pts),
      fill: "none",
      stroke: dark ? "#231a12" : "#8e7b5c",
      width: dark ? 0.6 : 0.38,
      opacity: dark ? 0.65 : 0.38,
      dash: dash.join(" "),
    });
  }
  let marks = "";
  for (let i = 2; i < to; i += 2) {
    if (r() < 0.6) continue;
    const q = m.s[i];
    const w = m.width(i);
    const c = add(q.p, scale(q.n, jitter(r, 0.28) * w));
    marks += `M${point(add(c, scale(q.n, -0.1 * w)))}L${point(add(c, scale(q.n, 0.1 * w)))}`;
  }
  out.push({
    d: marks,
    fill: "none",
    stroke: "#cbb994",
    width: 0.42,
    opacity: 0.42,
  });
  return out;
}

function leafImage(twig: Twig): ImageShape | null {
  if (!twig.leaf) return null;
  const { variant, rotate } = twig.leaf;
  const leaf = ivyLeaves[variant];
  const k = ivyScale(variant, twig.size);
  return {
    href: ivySrc(variant),
    width: leaf.w,
    height: leaf.h,
    transform: `translate(${point(twig.junction)}) rotate(${rotate}) scale(${k.toFixed(4)}) translate(${-leaf.jx} ${-leaf.jy})`,
  };
}

/** Petiole arcing from a one-sided node on the stem to the leaf's junction. */
function petiole(twig: Twig, m: Model): { shapes: PathShape[]; knob: string } {
  const i = nearestIndex(m.s, twig.node);
  const q = m.s[i];
  const side = dot(q.n, sub(twig.junction, q.p)) > 0 ? 1 : -1;
  const start = add(q.p, scale(q.n, side * m.width(i) * 0.32));
  const reach = length(sub(twig.junction, start));
  const out = unit(add(scale(q.n, side), scale(q.t, 0.9)));
  const angle = twig.leaf
    ? ivyLeaves[twig.leaf.variant].pa + twig.leaf.rotate
    : twig.petiole;
  const pts = cubic(
    [
      start,
      add(start, scale(out, reach * 0.5)),
      add(twig.junction, scale(heading(angle), reach * 0.42)),
      twig.junction,
    ],
    16
  );
  const w0 = Math.max(1.2, twig.size * 0.062);
  const w1 = Math.max(0.8, twig.size * 0.036);
  const sheen = pts.map((p, n) => {
    const d = unit(sub(pts[Math.min(16, n + 1)], pts[Math.max(0, n - 1)]));
    return add(p, scale([d[1], -d[0]], w1 * 0.28));
  });
  const r = m.width(i) * 0.42 + 0.5;
  return {
    shapes: [
      {
        d: taper(
          pts.map((p) => add(p, [1.3, 2.4])),
          w0,
          w1
        ),
        fill: "#000",
        opacity: 0.3,
      },
      {
        d: taper(pts, w0, w1),
        fill: `url(#ivy-${twig.junction[0] >= start[0] ? "pr" : "pl"})`,
      },
      {
        d: polyline(sheen),
        fill: "none",
        stroke: "#d2e2a4",
        width: 0.32,
        opacity: 0.45,
      },
    ],
    knob: `M${point(add(start, [-r, 0]))}a${r} ${r * 0.62} 0 1 0 ${2 * r} 0a${r} ${r * 0.62} 0 1 0 ${-2 * r} 0Z`,
  };
}

function twigs(layout: VineLayout, models: Model[], out: VineShapes): void {
  let knobs = "";
  for (const twig of layout.twigs) {
    const m = models[twig.stem];
    if (!m) continue;
    const target = twig.back ? out.back : out.front;
    const p = petiole(twig, m);
    target.push(...p.shapes);
    knobs += p.knob;
    const image = leafImage(twig);
    if (image) target.push(image);
  }
  out.body.push({ d: knobs, fill: "url(#ivy-lit)", opacity: 0.85 });
}

export function drawVine(layout: VineLayout): VineShapes {
  const r = rng(11);
  const models = layout.stems.map((stem, i) => model(stem, i + 3));
  const main = models[0];
  const out: VineShapes = {
    back: [
      { d: castShadow(main, [3.2, 4.4], 1.6), fill: "#000", opacity: 0.18 },
      { d: castShadow(main, [1.6, 2.2], 0.5), fill: "#000", opacity: 0.3 },
      ...rootlets(main, r),
    ],
    body: [],
    front: [],
    span: [main.s[0].p[1], main.s[main.s.length - 1].p[1]],
  };
  models.forEach((m) => {
    out.body.push(...cylinder(m));
    if (m.stem.main) out.body.push(...bark(m, r));
  });
  twigs(layout, models, out);
  return out;
}
