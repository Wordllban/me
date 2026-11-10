// Ivy leaves baked from one photographed Hedera helix leaf: warped per leaf,
// toned with the v1 violets and relit, with a soft shadow baked in.
// w/h: image size; jx/jy: petiole junction; 100*k px = terminal lobe length;
// pa: direction the petiole leaves the junction (degrees, clockwise from up).

export interface IvyLeaf {
  w: number;
  h: number;
  jx: number;
  jy: number;
  k: number;
  pa: number;
}

export const ivyLeaves = {
  c1: { w: 143, h: 140, jx: 47, jy: 61, k: 0.85, pa: 281.5 },
  c2: { w: 144, h: 142, jx: 56, jy: 60, k: 0.85, pa: -45.5 },
  c3: { w: 140, h: 139, jx: 39, jy: 65, k: 0.85, pa: 273.5 },
  c4: { w: 139, h: 137, jx: 57, jy: 56, k: 0.85, pa: -39.5 },
  c5: { w: 144, h: 143, jx: 47, jy: 60, k: 0.85, pa: 285.5 },
  c6: { w: 149, h: 142, jx: 55, jy: 61, k: 0.85, pa: -49.5 },
  c7: { w: 137, h: 137, jx: 42, jy: 63, k: 0.85, pa: 277.5 },
  w1: { w: 144, h: 142, jx: 95, jy: 59, k: 0.85, pa: -287.5 },
  w2: { w: 147, h: 149, jx: 100, jy: 63, k: 0.85, pa: 65.5 },
  w3: { w: 142, h: 140, jx: 87, jy: 58, k: 0.85, pa: -297.5 },
  w4: { w: 145, h: 146, jx: 95, jy: 62, k: 0.85, pa: 57.5 },
  wi1: { w: 150, h: 146, jx: 95, jy: 57, k: 0.85, pa: 47.5 },
  b2: { w: 148, h: 141, jx: 45, jy: 79, k: 0.85, pa: -99.5 },
  m1: { w: 142, h: 144, jx: 65, jy: 44, k: 0.85, pa: -9.5 },
  m2: { w: 135, h: 134, jx: 48, jy: 57, k: 0.85, pa: 289.5 },
  c9: { w: 133, h: 138, jx: 56, jy: 56, k: 0.85, pa: -31.5 },
  c10: { w: 140, h: 145, jx: 59, jy: 54, k: 0.85, pa: 319.5 },
  y1: { w: 102, h: 112, jx: 59, jy: 76, k: 0.6, pa: 149.5 },
  y2: { w: 108, h: 113, jx: 43, jy: 73, k: 0.6, pa: -141.5 },
  y3: { w: 107, h: 107, jx: 40, jy: 65, k: 0.6, pa: 221.5 },
  u1: { w: 126, h: 133, jx: 72, jy: 91, k: 0.7, pa: 155.5 },
  u2: { w: 132, h: 133, jx: 60, jy: 93, k: 0.7, pa: -159.5 },
  u3: { w: 121, h: 123, jx: 68, jy: 82, k: 0.7, pa: -193.5 },
  u4: { w: 122, h: 128, jx: 57, jy: 89, k: 0.7, pa: 187.5 },
  u5: { w: 134, h: 125, jx: 72, jy: 87, k: 0.7, pa: 163.5 },
  u6: { w: 127, h: 130, jx: 51, jy: 82, k: 0.7, pa: -145.5 },
  u7: { w: 128, h: 133, jx: 74, jy: 89, k: 0.7, pa: 151.5 },
  v1: { w: 132, h: 131, jx: 72, jy: 90, k: 0.7, pa: 161.5 },
  v2: { w: 132, h: 128, jx: 64, jy: 90, k: 0.7, pa: 181.5 },
  v3: { w: 130, h: 125, jx: 75, jy: 82, k: 0.7, pa: 153.5 },
} as const satisfies Record<string, IvyLeaf>;

export type IvyVariant = keyof typeof ivyLeaves;

/** Upright leaves used for icons, bullets and the leaf-rain easter egg. */
export const uprightLeaves = [
  "u1",
  "u2",
  "u3",
  "u4",
  "u5",
  "u6",
  "u7",
] as const satisfies readonly IvyVariant[];

export function ivySrc(variant: IvyVariant): string {
  return `/assets/ivy/${variant}.webp`;
}

/** Image px per leaf px, for a leaf whose terminal lobe is `length` px long. */
export function ivyScale(variant: IvyVariant, length: number): number {
  return length / (100 * ivyLeaves[variant].k);
}
