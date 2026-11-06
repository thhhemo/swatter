import type { Rng } from '../game/rng';

type Pt = { x: number; y: number };

export function polygonPath(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
}

/** Ellipse rotated by `rotDeg`, as a polygon, so no `transform` attribute is needed. */
export function ellipsePath(cx: number, cy: number, rx: number, ry: number, rotDeg = 0, steps = 28): string {
  const rot = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const pts: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const px = Math.cos(a) * rx;
    const py = Math.sin(a) * ry;
    pts.push({ x: cx + px * cos - py * sin, y: cy + px * sin + py * cos });
  }
  return polygonPath(pts);
}

/** Jagged splat outline: alternating long and short spikes with random lengths. */
export function starburstPath(cx: number, cy: number, inner: number, outer: number, spikes: number, rng: Rng): string {
  const pts: Pt[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outer * (0.6 + rng() * 0.4) : inner * (0.8 + rng() * 0.4);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return polygonPath(pts);
}

export function linePath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
