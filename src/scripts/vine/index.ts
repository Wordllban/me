// The desktop rail's ivy: measures the real chapter rows, grows the vine to
// fit them and re-grows it whenever the rail changes size.

import { drawVine, type Shape, type VineShapes } from "./draw";
import { type Anchor, type Frame, layoutVine } from "./layout";

const SVG_NS = "http://www.w3.org/2000/svg";

interface Measured {
  anchors: Anchor[];
  frame: Frame;
}

function measure(rail: HTMLElement): Measured | null {
  const box = rail.getBoundingClientRect();
  if (!box.width || !box.height) return null; // rail hidden on tablet / mobile
  const anchors = [
    ...rail.querySelectorAll<HTMLElement>("[data-junction]"),
  ].map((a): Anchor => {
    const at = a.getBoundingClientRect();
    const row = a.closest("button")?.getBoundingClientRect() ?? at;
    const leaf = a.parentElement?.querySelector<HTMLElement>("img");
    const perPx = Number(a.dataset.imagePerLength) || 1;
    return {
      junction: [at.left - box.left, at.top - box.top],
      row: row.top + row.height / 2 - box.top,
      petiole: Number(a.dataset.petiole) || 0,
      size: leaf ? leaf.offsetWidth / perPx : 32,
    };
  });
  if (anchors.length < 2) return null;
  const intro = rail
    .querySelector("[data-rail-intro]")
    ?.getBoundingClientRect();
  return {
    anchors,
    frame: {
      width: box.width,
      height: box.height,
      ceiling: intro ? intro.bottom - box.top : 0,
    },
  };
}

function signature(m: Measured): string {
  const rows = m.anchors.map((a) => a.junction.map(Math.round).join(","));
  return `${Math.round(m.frame.width)}x${Math.round(m.frame.height)}|${Math.round(m.frame.ceiling)}|${rows.join(";")}`;
}

function element(shape: Shape): SVGElement {
  if ("href" in shape) {
    const img = document.createElementNS(SVG_NS, "image");
    img.setAttribute("href", shape.href);
    img.setAttribute("width", String(shape.width));
    img.setAttribute("height", String(shape.height));
    img.setAttribute("transform", shape.transform);
    return img;
  }
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", shape.d);
  path.setAttribute("fill", shape.fill);
  if (shape.stroke) {
    path.setAttribute("stroke", shape.stroke);
    path.setAttribute("stroke-width", String(shape.width ?? 1));
    path.setAttribute("stroke-linecap", "round");
  }
  if (shape.opacity !== undefined)
    path.setAttribute("opacity", String(shape.opacity));
  if (shape.dash) path.setAttribute("stroke-dasharray", shape.dash);
  return path;
}

function paint(svg: SVGSVGElement, shapes: VineShapes, frame: Frame): void {
  svg.setAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
  for (const id of ["ivy-bark", "ivy-lit", "ivy-hi"]) {
    const g = svg.querySelector(`#${id}`);
    g?.setAttribute("y1", String(shapes.span[0]));
    g?.setAttribute("y2", String(shapes.span[1]));
  }
  const body = svg.querySelector("[data-vine-body]");
  body?.replaceChildren(
    ...[...shapes.back, ...shapes.body, ...shapes.front].map(element)
  );
  svg.setAttribute("data-ready", "");
}

export function initVine(root: HTMLElement): void {
  const rail = root.querySelector<HTMLElement>("[data-rail]");
  const svg = rail?.querySelector<SVGSVGElement>("svg[data-vine]");
  if (!rail || !svg) return;
  let last = "";
  const update = () => {
    const m = measure(rail);
    if (!m) return;
    const sig = signature(m);
    if (sig === last) return;
    last = sig;
    paint(svg, drawVine(layoutVine(m.anchors, m.frame)), m.frame);
  };
  update();
  requestAnimationFrame(update);
  document.fonts?.ready?.then(update);
  new ResizeObserver(update).observe(rail);
}
