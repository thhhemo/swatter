import type { Rng } from './rng';

export type FlyMode = 'wait' | 'fly' | 'leave';
type Burst = 'none' | 'dart' | 'hover';

const KILL_MARGIN = 8;
const OFF_PAD = 48;
const MAX_DT = 0.05;

const CRUISE = 0.7; // x longer screen side per second
const DART_MUL = 1.6;
const DART_TIME = 0.28;
const HOVER_MUL = 0.2;
const HOVER_TIME = 0.4;
const LEAVE_MUL = 1.35;

const RETARGET: [number, number] = [0.2, 0.8];
const DIP_TIME: [number, number] = [0.6, 1.2];
const FIRST_WAIT: [number, number] = [1, 2.5];

export type LevelConfig = {
  /** Multiplies every speed. */
  speed: number;
  /** Seconds the fly stays before leaving. */
  fly: [number, number];
  /** Seconds between one fly leaving and the next arriving. */
  away: [number, number];
  /** Chance that a retarget is a fast dart. */
  dart: number;
  /** Chance that a retarget is a hover. */
  hover: number;
  /** Chance that a retarget sends the fly briefly off the edge of the screen. */
  dip: number;
  /** How close to the fly's centre a tap must land, as a fraction of the fly's size. */
  hit: number;
};

/** Level 1 is the original game; higher levels are faster and spend more time out of sight. */
export const LEVELS: LevelConfig[] = [
  { speed: 1.0, fly: [4.5, 7.5], away: [1.6, 3.6], dart: 0.18, hover: 0.15, dip: 0, hit: 0.42 },
  { speed: 1.25, fly: [3.8, 6.2], away: [2.0, 4.0], dart: 0.26, hover: 0.12, dip: 0.1, hit: 0.36 },
  { speed: 1.5, fly: [3.2, 5.2], away: [2.3, 4.4], dart: 0.3, hover: 0.1, dip: 0.2, hit: 0.3 },
  { speed: 1.8, fly: [2.6, 4.2], away: [2.6, 4.8], dart: 0.34, hover: 0.08, dip: 0.3, hit: 0.24 },
  { speed: 2.2, fly: [2.0, 3.4], away: [3.0, 5.2], dart: 0.4, hover: 0.05, dip: 0.4, hit: 0.18 },
];
export const MAX_LEVEL = LEVELS.length;

function normalizeAngle(a: number): number {
  return ((((a + 180) % 360) + 360) % 360) - 180;
}

/**
 * Pure fly flight simulation, in screen pixels. The fly is a point (its centre);
 * `angle` is the heading in degrees, 0 = sprite head pointing up.
 */
export class FlySim {
  x = -9999;
  y = -9999;
  vx = 0;
  vy = 0;
  angle = 0;
  mode: FlyMode = 'wait';
  level = 1;
  /** Player-chosen difficulty: scales speed and how precise a tap must be. */
  speedScale = 1;
  hitScale = 1;

  private width: number;
  private height: number;
  private rng: Rng;
  private waitLeft: number;
  private flyLeft = 0;
  private retargetLeft = 0;
  private tx = 0;
  private ty = 0;
  private burst: Burst = 'none';
  private burstLeft = 0;

  constructor(width: number, height: number, rng: Rng = Math.random) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.waitLeft = this.range(FIRST_WAIT);
  }

  /** Takes effect straight away for speed, and from the next arrival or departure for timings. */
  setLevel(level: number): void {
    this.level = Math.min(MAX_LEVEL, Math.max(1, Math.round(level)));
  }

  /** Distance from the fly's centre, in pixels, within which a tap counts as a hit. */
  hitRadius(flySize: number): number {
    return flySize * this.cfg.hit * this.hitScale;
  }

  setDifficulty(speed: number, hit: number): void {
    this.speedScale = speed;
    this.hitScale = hit;
  }

  private get cfg(): LevelConfig {
    return LEVELS[this.level - 1];
  }

  setBounds(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    if (this.mode !== 'wait') {
      this.x *= width / this.width;
      this.y *= height / this.height;
      this.tx *= width / this.width;
      this.ty *= height / this.height;
    }
    this.width = width;
    this.height = height;
  }

  isOnScreen(): boolean {
    return (
      this.mode !== 'wait' &&
      this.x >= KILL_MARGIN &&
      this.x <= this.width - KILL_MARGIN &&
      this.y >= KILL_MARGIN &&
      this.y <= this.height - KILL_MARGIN
    );
  }

  /** Squash the fly if it is on screen. Returns where it was, or null on a miss. */
  kill(): { x: number; y: number; angle: number } | null {
    if (!this.isOnScreen()) return null;
    const hit = { x: this.x, y: this.y, angle: this.angle };
    this.goToWait();
    return hit;
  }

  step(dtRaw: number): void {
    const dt = Math.min(Math.max(dtRaw, 0), MAX_DT);
    if (dt === 0) return;

    if (this.mode === 'wait') {
      this.waitLeft -= dt;
      if (this.waitLeft <= 0) this.spawn();
      return;
    }

    if (this.mode === 'fly') {
      this.flyLeft -= dt;
      if (this.flyLeft <= 0) this.startLeaving();
    }

    this.burstLeft -= dt;
    if (this.burstLeft <= 0) this.burst = 'none';
    this.retargetLeft -= dt;
    if (this.mode === 'fly' && this.retargetLeft <= 0) this.pickTarget();

    const cruise = CRUISE * this.cfg.speed * this.speedScale * Math.max(this.width, this.height);
    let mul = 1;
    if (this.mode === 'leave') mul = LEAVE_MUL;
    else if (this.burst === 'dart') mul = DART_MUL;
    else if (this.burst === 'hover') mul = HOVER_MUL;

    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const wantX = (dx / dist) * cruise * mul;
    const wantY = (dy / dist) * cruise * mul;

    // Steer towards the wanted velocity, plus constant random buzz.
    const k = Math.min(1, 5 * dt);
    this.vx += (wantX - this.vx) * k + this.gauss() * cruise * 4 * dt;
    this.vy += (wantY - this.vy) * k + this.gauss() * cruise * 4 * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (Math.hypot(this.vx, this.vy) > 5) {
      const heading = (Math.atan2(this.vy, this.vx) * 180) / Math.PI + 90;
      const diff = normalizeAngle(heading - this.angle);
      this.angle = normalizeAngle(this.angle + diff * Math.min(1, 10 * dt));
    }

    if (this.mode === 'leave' && this.isFullyOff()) this.goToWait();
  }

  private range([lo, hi]: [number, number]): number {
    return lo + this.rng() * (hi - lo);
  }

  /** Roughly normal, mean 0, spread about 1. */
  private gauss(): number {
    return (this.rng() + this.rng() + this.rng() - 1.5) * 2;
  }

  private isFullyOff(): boolean {
    const m = OFF_PAD / 2;
    return this.x < -m || this.x > this.width + m || this.y < -m || this.y > this.height + m;
  }

  private goToWait(): void {
    this.mode = 'wait';
    this.waitLeft = this.range(this.cfg.away);
    this.x = -9999;
    this.y = -9999;
    this.vx = 0;
    this.vy = 0;
  }

  /** A random point just outside the given edge (0 top, 1 right, 2 bottom, 3 left). */
  private edgePoint(edge: number, pad: number): { x: number; y: number } {
    const along = this.rng();
    switch (edge) {
      case 0:
        return { x: along * this.width, y: -pad };
      case 1:
        return { x: this.width + pad, y: along * this.height };
      case 2:
        return { x: along * this.width, y: this.height + pad };
      default:
        return { x: -pad, y: along * this.height };
    }
  }

  private spawn(): void {
    const start = this.edgePoint(Math.floor(this.rng() * 4), OFF_PAD);
    this.x = start.x;
    this.y = start.y;
    this.mode = 'fly';
    this.flyLeft = this.range(this.cfg.fly);
    this.burst = 'none';
    this.burstLeft = 0;
    this.pickTarget(false);
    const dist = Math.hypot(this.tx - this.x, this.ty - this.y) || 1;
    const cruise = CRUISE * this.cfg.speed * this.speedScale * Math.max(this.width, this.height);
    this.vx = ((this.tx - this.x) / dist) * cruise;
    this.vy = ((this.ty - this.y) / dist) * cruise;
  }

  /** `allowDip` is false on arrival, so a new fly always flies into view first. */
  private pickTarget(allowDip = true): void {
    if (allowDip && this.cfg.dip > 0 && this.rng() < this.cfg.dip) {
      const out = this.edgePoint(Math.floor(this.rng() * 4), OFF_PAD * 0.8);
      this.tx = out.x;
      this.ty = out.y;
      this.burst = 'none';
      this.retargetLeft = this.range(DIP_TIME);
      return;
    }
    const padX = this.width * 0.08;
    const padY = this.height * 0.08;
    this.tx = padX + this.rng() * (this.width - 2 * padX);
    this.ty = padY + this.rng() * (this.height - 2 * padY);

    const roll = this.rng();
    if (roll < this.cfg.dart) {
      this.burst = 'dart';
      this.burstLeft = DART_TIME;
    } else if (roll < this.cfg.dart + this.cfg.hover) {
      this.burst = 'hover';
      this.burstLeft = HOVER_TIME;
    }
    this.retargetLeft = this.burst === 'none' ? this.range(RETARGET) : this.burstLeft;
  }

  private startLeaving(): void {
    this.mode = 'leave';
    this.burst = 'none';
    this.burstLeft = 0;
    const exit = this.edgePoint(Math.floor(this.rng() * 4), OFF_PAD * 3);
    this.tx = exit.x;
    this.ty = exit.y;
  }
}
