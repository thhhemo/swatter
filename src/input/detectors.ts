export type HingeReading = { angle: number; status: string } | null;

type HingeOptions = { openAngle?: number; closeAngle?: number };

export type HingeEvent = 'slam' | 'open' | null;

/**
 * Fires `slam` once when the hinge closes after having been open, then `open`
 * once when it is opened again. Android never reports `closed`, so the angle
 * decides on both platforms.
 */
export class HingeSlamDetector {
  private armed = false;
  private awaitingOpen = false;
  private openAngle: number;
  private closeAngle: number;

  constructor(options: HingeOptions = {}) {
    this.openAngle = options.openAngle ?? 40;
    this.closeAngle = options.closeAngle ?? 12;
  }

  updateEvent(hinge: HingeReading): HingeEvent {
    if (!hinge) return null;
    if (hinge.angle >= this.openAngle) {
      this.armed = true;
      if (this.awaitingOpen) {
        this.awaitingOpen = false;
        return 'open';
      }
      return null;
    }
    const closed = hinge.status === 'closed' || hinge.angle <= this.closeAngle;
    if (this.armed && closed) {
      this.armed = false;
      this.awaitingOpen = true;
      return 'slam';
    }
    return null;
  }

  update(hinge: HingeReading): boolean {
    return this.updateEvent(hinge) === 'slam';
  }
}

type FlipOptions = { windowMs?: number; thresholdRad?: number; cooldownMs?: number };

/** Regular-phone fallback: a quick flip is a big y-axis rotation inside a short window. */
export class FlipDetector {
  private samples: { t: number; a: number }[] = [];
  private lastT: number | null = null;
  private cooldownUntil = 0;
  private windowMs: number;
  private thresholdRad: number;
  private cooldownMs: number;

  constructor(options: FlipOptions = {}) {
    this.windowMs = options.windowMs ?? 600;
    this.thresholdRad = options.thresholdRad ?? 2.0;
    this.cooldownMs = options.cooldownMs ?? 1500;
  }

  /** `rateY` is rad/s around the y axis, `tMs` a monotonic timestamp. */
  update(rateY: number, tMs: number): boolean {
    if (this.lastT === null) {
      this.lastT = tMs;
      return false;
    }
    const dt = Math.min((tMs - this.lastT) / 1000, 0.1);
    this.lastT = tMs;
    if (dt <= 0) return false;

    this.samples.push({ t: tMs, a: rateY * dt });
    while (this.samples.length > 0 && this.samples[0].t < tMs - this.windowMs) {
      this.samples.shift();
    }
    if (tMs < this.cooldownUntil) return false;

    const total = this.samples.reduce((sum, s) => sum + s.a, 0);
    if (Math.abs(total) >= this.thresholdRad) {
      this.samples = [];
      this.cooldownUntil = tMs + this.cooldownMs;
      return true;
    }
    return false;
  }
}
