import assert from 'node:assert/strict';
import { DIFFICULTIES, isDifficulty } from '../src/settings/difficulty.ts';
import { KIND_LABEL, QUOTES } from '../src/content/quotes.ts';
import { pageNumber, pickQuote } from '../src/content/pick.ts';
import { FlySim, LEVELS, MAX_LEVEL } from '../src/game/flySim.ts';
import { mulberry32 } from '../src/game/rng.ts';
import { FlipDetector, HingeSlamDetector } from '../src/input/detectors.ts';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

const W = 400;
const H = 800;
const DT = 1 / 60;

/** Step until `cond` is true (max `limit` seconds). Returns elapsed seconds. */
function runUntil(sim: FlySim, cond: () => boolean, limit = 30): number {
  let t = 0;
  while (!cond() && t < limit) {
    sim.step(DT);
    t += DT;
  }
  return t;
}

test('starts waiting and off screen', () => {
  const sim = new FlySim(W, H, mulberry32(1));
  assert.equal(sim.mode, 'wait');
  assert.equal(sim.isOnScreen(), false);
});

test('enters from outside the screen after the first wait', () => {
  const sim = new FlySim(W, H, mulberry32(2));
  const t = runUntil(sim, () => sim.mode === 'fly');
  assert.ok(t >= 1 && t <= 2.6, `first wait was ${t}s`);
  assert.equal(sim.isOnScreen(), false);
});

test('reaches the screen and is killable', () => {
  const sim = new FlySim(W, H, mulberry32(3));
  runUntil(sim, () => sim.isOnScreen());
  assert.equal(sim.isOnScreen(), true);
  const hit = sim.kill();
  assert.ok(hit);
  assert.ok(hit.x >= 8 && hit.x <= W - 8 && hit.y >= 8 && hit.y <= H - 8);
  assert.equal(sim.mode, 'wait');
  assert.equal(sim.isOnScreen(), false);
});

test('kill misses while waiting', () => {
  const sim = new FlySim(W, H, mulberry32(4));
  assert.equal(sim.kill(), null);
});

test('kill misses while the fly is still outside', () => {
  const sim = new FlySim(W, H, mulberry32(5));
  runUntil(sim, () => sim.mode === 'fly');
  assert.equal(sim.kill(), null);
  assert.equal(sim.mode, 'fly');
});

test('stays 4.5 to 7.5 s, then leaves and waits again', () => {
  for (let seed = 10; seed < 20; seed++) {
    const sim = new FlySim(W, H, mulberry32(seed));
    runUntil(sim, () => sim.mode === 'fly');
    const flew = runUntil(sim, () => sim.mode === 'leave');
    assert.ok(flew >= 4.4 && flew <= 7.6, `seed ${seed}: flew ${flew}s`);
    runUntil(sim, () => sim.mode === 'wait');
    assert.equal(sim.isOnScreen(), false);
  }
});

test('respawns 1.6 to 3.6 s after leaving', () => {
  for (let seed = 30; seed < 40; seed++) {
    const sim = new FlySim(W, H, mulberry32(seed));
    runUntil(sim, () => sim.isOnScreen());
    sim.kill();
    const away = runUntil(sim, () => sim.mode === 'fly');
    assert.ok(away >= 1.55 && away <= 3.7, `seed ${seed}: away ${away}s`);
  }
});

test('heading stays in [-180, 180) and the fly keeps moving', () => {
  const sim = new FlySim(W, H, mulberry32(50));
  let moved = 0;
  for (let i = 0; i < 60 * 40; i++) {
    sim.step(DT);
    assert.ok(sim.angle >= -180 && sim.angle < 180, `angle ${sim.angle}`);
    if (sim.mode !== 'wait') moved += Math.hypot(sim.vx, sim.vy) * DT;
  }
  assert.ok(moved > 500);
});

test('a huge dt is capped', () => {
  const sim = new FlySim(W, H, mulberry32(60));
  runUntil(sim, () => sim.mode === 'fly');
  const { x, y } = sim;
  sim.step(10);
  assert.ok(Math.hypot(sim.x - x, sim.y - y) < 80);
});

test('setBounds rescales a flying fly', () => {
  const sim = new FlySim(W, H, mulberry32(70));
  runUntil(sim, () => sim.isOnScreen());
  const { x, y } = sim;
  sim.setBounds(W * 2, H / 2);
  assert.ok(Math.abs(sim.x - x * 2) < 1e-6);
  assert.ok(Math.abs(sim.y - y / 2) < 1e-6);
});

test('hinge slam (iOS style): open, then closed fires once and re-arms', () => {
  const d = new HingeSlamDetector();
  assert.equal(d.update({ angle: 180, status: 'fullyOpen' }), false);
  assert.equal(d.update({ angle: 90, status: 'partiallyOpen' }), false);
  assert.equal(d.update({ angle: 0, status: 'closed' }), true);
  assert.equal(d.update({ angle: 0, status: 'closed' }), false);
  assert.equal(d.update({ angle: 100, status: 'partiallyOpen' }), false);
  assert.equal(d.update({ angle: 3, status: 'closed' }), true);
});

test('hinge slam (Android style): angle only, status never closed', () => {
  const d = new HingeSlamDetector();
  assert.equal(d.update({ angle: 150, status: 'fullyOpen' }), false);
  assert.equal(d.update({ angle: 30, status: 'partiallyOpen' }), false);
  assert.equal(d.update({ angle: 8, status: 'unknown' }), true);
  assert.equal(d.update({ angle: 2, status: 'unknown' }), false);
});

test('hinge slam: never fires without opening first, or on null', () => {
  const d = new HingeSlamDetector();
  assert.equal(d.update({ angle: 0, status: 'closed' }), false);
  assert.equal(d.update(null), false);
  d.update({ angle: 120, status: 'partiallyOpen' });
  assert.equal(d.update(null), false);
});

test('hinge reports open once after a slam, then re-arms for the next slam', () => {
  const d = new HingeSlamDetector();
  assert.equal(d.updateEvent({ angle: 170, status: 'fullyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 120, status: 'partiallyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 4, status: 'closed' }), 'slam');
  assert.equal(d.updateEvent({ angle: 2, status: 'closed' }), null);
  assert.equal(d.updateEvent({ angle: 25, status: 'partiallyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 60, status: 'partiallyOpen' }), 'open');
  assert.equal(d.updateEvent({ angle: 150, status: 'fullyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 3, status: 'closed' }), 'slam');
});

test('hinge never reports open without a slam first', () => {
  const d = new HingeSlamDetector();
  assert.equal(d.updateEvent({ angle: 20, status: 'partiallyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 90, status: 'partiallyOpen' }), null);
  assert.equal(d.updateEvent({ angle: 170, status: 'fullyOpen' }), null);
});

test('flip detector fires on a quick flip, respects cooldown, ignores wobble', () => {
  const d = new FlipDetector();
  let t = 0;
  let fired = 0;
  // gentle wobble: 0.5 rad/s for 2 s = 1 rad total, never 2 rad in 600 ms
  for (let i = 0; i < 100; i++) if (d.update(0.5, (t += 20))) fired++;
  assert.equal(fired, 0);
  // flip: 8 rad/s for 400 ms = 3.2 rad
  for (let i = 0; i < 20; i++) if (d.update(8, (t += 20))) fired++;
  assert.equal(fired, 1);
  // immediately flipping again is inside the cooldown
  for (let i = 0; i < 20; i++) if (d.update(-8, (t += 20))) fired++;
  assert.equal(fired, 1);
});

test('setLevel clamps to 1..5', () => {
  const sim = new FlySim(W, H, mulberry32(80));
  assert.equal(sim.level, 1);
  sim.setLevel(3);
  assert.equal(sim.level, 3);
  sim.setLevel(99);
  assert.equal(sim.level, MAX_LEVEL);
  sim.setLevel(-4);
  assert.equal(sim.level, 1);
});

test('level table gets faster and shorter, with longer gaps', () => {
  assert.equal(LEVELS.length, 5);
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(LEVELS[i].speed > LEVELS[i - 1].speed);
    assert.ok(LEVELS[i].fly[1] < LEVELS[i - 1].fly[1]);
    assert.ok(LEVELS[i].away[0] > LEVELS[i - 1].away[0]);
  }
});

test('level 5 flies stay 2.0 to 3.4 s and are away 3.0 to 5.2 s', () => {
  for (let seed = 90; seed < 100; seed++) {
    const sim = new FlySim(W, H, mulberry32(seed));
    sim.setLevel(5);
    runUntil(sim, () => sim.mode === 'fly');
    const flew = runUntil(sim, () => sim.mode !== 'fly');
    assert.ok(flew >= 1.9 && flew <= 3.5, `seed ${seed}: flew ${flew}s`);
    runUntil(sim, () => sim.mode === 'wait');
    const away = runUntil(sim, () => sim.mode === 'fly');
    assert.ok(away >= 2.9 && away <= 5.3, `seed ${seed}: away ${away}s`);
  }
});

test('a higher level is on screen less of the time, and never gets easier', () => {
  const share: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    let on = 0;
    let total = 0;
    for (let seed = 100; seed < 112; seed++) {
      const sim = new FlySim(W, H, mulberry32(seed));
      sim.setLevel(level);
      for (let i = 0; i < 60 * 120; i++) {
        sim.step(DT);
        total++;
        if (sim.isOnScreen()) on++;
      }
    }
    share.push(on / total);
  }
  console.log('  on-screen share by level:', share.map((s) => s.toFixed(2)).join(' '));
  assert.ok(share[4] < share[0] - 0.15, `level 5 ${share[4]} vs level 1 ${share[0]}`);
  for (let i = 1; i < share.length; i++) {
    assert.ok(share[i] <= share[i - 1] + 0.02, `level ${i + 1} easier than ${i}`);
  }
});

test('a tap must land closer to the middle at higher levels', () => {
  const sim = new FlySim(W, H, mulberry32(130));
  let last = Infinity;
  for (let level = 1; level <= MAX_LEVEL; level++) {
    sim.setLevel(level);
    const r = sim.hitRadius(64);
    assert.ok(r < last, `level ${level} radius ${r} not tighter than ${last}`);
    last = r;
  }
  sim.setLevel(1);
  assert.ok(sim.hitRadius(64) <= 28, 'level 1 is already far tighter than the old 51 px');
  sim.setLevel(5);
  assert.ok(sim.hitRadius(64) <= 12);
});

test('difficulty presets scale target size and speed', () => {
  assert.deepEqual(DIFFICULTIES.map((d) => d.id), ['easy', 'normal', 'hard']);
  assert.ok(isDifficulty('hard') && !isDifficulty('nightmare') && !isDifficulty(null));
  const radius = (d: number) => {
    const sim = new FlySim(W, H, mulberry32(140));
    sim.setDifficulty(DIFFICULTIES[d].speed, DIFFICULTIES[d].hit);
    return sim.hitRadius(64);
  };
  assert.ok(radius(0) > radius(1) && radius(1) > radius(2));
  const avg = (d: number) => {
    const sim = new FlySim(W, H, mulberry32(141));
    sim.setDifficulty(DIFFICULTIES[d].speed, DIFFICULTIES[d].hit);
    let sum = 0, n = 0;
    for (let i = 0; i < 60 * 60; i++) {
      sim.step(DT);
      if (sim.mode === 'fly' && sim.isOnScreen()) { sum += Math.hypot(sim.vx, sim.vy); n++; }
    }
    return sum / n;
  };
  assert.ok(avg(0) < avg(1) && avg(1) < avg(2));
});

test('higher levels fly faster', () => {
  const avg = (level: number) => {
    const sim = new FlySim(W, H, mulberry32(120));
    sim.setLevel(level);
    let sum = 0;
    let n = 0;
    for (let i = 0; i < 60 * 60; i++) {
      sim.step(DT);
      if (sim.mode === 'fly' && sim.isOnScreen()) {
        sum += Math.hypot(sim.vx, sim.vy);
        n++;
      }
    }
    return sum / n;
  };
  assert.ok(avg(5) > avg(1) * 1.6, `${avg(5)} vs ${avg(1)}`);
});

test('quotes: every entry is complete and fits on the page', () => {
  assert.ok(QUOTES.length >= 20);
  const ids = new Set<string>();
  for (const q of QUOTES) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(q.kind in KIND_LABEL, q.id);
    for (const field of ['text', 'author', 'work', 'year', 'about', 'tag', 'gloss', 'ask'] as const) {
      assert.ok(q[field].trim().length > 0, `${q.id}.${field} is empty`);
    }
    assert.ok(q.text.length <= 200, `${q.id} quote too long (${q.text.length})`);
    assert.ok(q.gloss.length <= 200, `${q.id} gloss too long (${q.gloss.length})`);
    assert.ok(q.tag.length <= 16, `${q.id} tag too long for the running head (${q.tag})`);
    assert.ok(q.ask.length <= 90, `${q.id} question too long (${q.ask.length})`);
    assert.ok(q.text.split('\n').length <= 4, `${q.id} has too many lines`);
  }
});

test('quotes: picker never repeats the previous one and reaches them all', () => {
  const rng = mulberry32(7);
  const seen = new Set<string>();
  let prev: string | null = null;
  for (let i = 0; i < 2000; i++) {
    const q = pickQuote(prev, rng);
    assert.notEqual(q.id, prev);
    seen.add(q.id);
    prev = q.id;
  }
  assert.equal(seen.size, QUOTES.length);
});

test('quotes: page numbers are even and distinct', () => {
  const pages = QUOTES.map(pageNumber);
  assert.ok(pages.every((p) => p % 2 === 0));
  assert.equal(new Set(pages).size, QUOTES.length);
});

console.log(`\n${passed} tests passed`);
