import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHinge } from 'expo-hinge';
import { pickQuote } from '../content/pick';
import type { Quote } from '../content/quotes';
import { FlySim, MAX_LEVEL, type FlyMode } from '../game/flySim';
import { useSlam, type SlamSource } from '../input/useSlam';
import { PaperBackdrop, WalnutBackdrop } from '../ui/Backdrops';
import { OpenBook, PhonePage } from '../ui/Book';
import { ClosedCover, type ClosedResult } from '../ui/ClosedCover';
import { DEFAULT_DIFFICULTY, difficultyInfo, type Difficulty } from '../settings/difficulty';
import { loadDifficulty, saveDifficulty } from '../settings/storage';
import { Sticky } from '../ui/Controls';
import { FLY_SIZE, FLY_SIZE_WIDE, FlyView } from '../ui/FlyView';
import { ThumpFlash } from '../ui/SlamCover';
import { SettingsSheet } from '../ui/SettingsSheet';
import { Splat } from '../ui/Splat';
import { TapRing } from '../ui/TapRing';
import { colors, fonts } from '../ui/theme';

const SLAM_MS = 900;
/** Ignore "open" signals for a moment after shutting, so the closing motion itself can't reopen. */
const MIN_CLOSED_MS = 700;

const KILL_CAPTIONS = [
  'Tell my 300 kids... I love them.',
  'Worth it.',
  'Not the face!',
  'I regret nothing. Bzzz.',
  'Karma has a hardcover.',
];
const MISS_CAPTIONS = [
  'Whiffed! Only air was harmed.',
  'Too early. The fly was out of sight.',
  'Missed. The fly is laughing at you.',
];

type Splatted = { x: number; y: number; id: number };

function Hud({ source, mode, light }: { source: SlamSource; mode: FlyMode; light: boolean }) {
  const hinge = useHinge();
  return (
    <Text style={[styles.hud, { color: light ? colors.onWalnut : colors.ink }]} pointerEvents="none">
      hinge: {hinge ? `${hinge.status} ${Math.round(hinge.angle)}°` : 'none'} · input: {source} · fly: {mode}
    </Text>
  );
}

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const wide = width >= 600;
  const flySize = wide ? FLY_SIZE_WIDE : FLY_SIZE;

  const simRef = useRef<FlySim | null>(null);
  if (!simRef.current) simRef.current = new FlySim(width, height);
  const sim = simRef.current;

  const pos = useRef(new Animated.ValueXY({ x: -9999, y: -9999 })).current;
  const rot = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const shut = useRef(new Animated.Value(0)).current;

  const pausedRef = useRef(false);
  const settingsRef = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [difficulty, setDifficultyState] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const closedRef = useRef(false);
  const closedAtRef = useRef(0);
  const killsRef = useRef(0);
  const missesRef = useRef(0);
  const splatId = useRef(0);
  const [kills, setKills] = useState(0);
  const [splat, setSplat] = useState<Splatted | null>(null);
  const [closed, setClosed] = useState<ClosedResult | null>(null);
  const [flash, setFlash] = useState(false);
  const [level, setLevelState] = useState(1);
  const [mode, setMode] = useState<FlyMode>('wait');
  const [quote, setQuote] = useState<Quote>(() => pickQuote(null));
  const quoteIdRef = useRef(quote.id);

  useEffect(() => {
    sim.setBounds(width, height);
  }, [sim, width, height]);

  /** Every swat turns to a new page of the book. */
  const nextQuote = useCallback(() => {
    const next = pickQuote(quoteIdRef.current);
    quoteIdRef.current = next.id;
    setQuote(next);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let wasOnScreen = false;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && !settingsRef.current) {
        sim.step(dt);
        pos.setValue({ x: sim.x - flySize / 2, y: sim.y - flySize / 2 });
        rot.setValue(sim.angle);
        const onScreen = sim.isOnScreen();
        if (onScreen && !wasOnScreen) setSplat(null);
        wasOnScreen = onScreen;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sim, pos, rot, flySize]);

  useEffect(() => {
    if (!__DEV__) return;
    const id = setInterval(() => setMode(sim.mode), 200);
    return () => clearInterval(id);
  }, [sim]);

  const changeLevel = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_LEVEL, Math.max(1, next));
      sim.setLevel(clamped);
      setLevelState(clamped);
    },
    [sim],
  );

  const splatSize = wide ? 260 : 220;
  const bookW = Math.min(920, width - 32);
  const bookH = Math.min(560, height - 158);
  const bookTop = 34;

  /** The book is opened again: the game picks up where it left off. */
  const reopen = useCallback(() => {
    if (!closedRef.current) return;
    if (Date.now() - closedAtRef.current < MIN_CLOSED_MS) return;
    closedRef.current = false;
    pausedRef.current = false;
    setClosed(null);
  }, []);

  /** Squash bookkeeping shared by a swat of the book and a tap on the fly. */
  const applyKill = useCallback(
    (hit: { x: number; y: number }) => {
      const previousLevel = sim.level;
      nextQuote();
      pos.setValue({ x: -9999, y: -9999 });
      killsRef.current += 1;
      setKills(killsRef.current);
      changeLevel(previousLevel + 1);
      const half = splatSize / 2;
      const minY = wide ? bookTop + half - 40 : half + 60;
      const maxY = wide ? bookTop + bookH - half + 40 : height - half - 160;
      setSplat({
        x: Math.max(half, Math.min(width - half, hit.x)),
        y: Math.max(minY, Math.min(maxY, hit.y)),
        id: ++splatId.current,
      });
      return { previousLevel, caption: KILL_CAPTIONS[(killsRef.current - 1) % KILL_CAPTIONS.length] };
    },
    [sim, pos, changeLevel, nextQuote, splatSize, width, height, wide, bookH],
  );

  useEffect(() => {
    loadDifficulty().then(setDifficultyState);
  }, []);
  useEffect(() => {
    const d = difficultyInfo(difficulty);
    sim.setDifficulty(d.speed, d.hit);
  }, [sim, difficulty]);
  const chooseDifficulty = useCallback((value: Difficulty) => {
    setDifficultyState(value);
    saveDifficulty(value);
  }, []);
  const openSettings = useCallback(() => {
    settingsRef.current = true;
    setSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => {
    settingsRef.current = false;
    setSettingsOpen(false);
  }, []);

  const onSlam = useCallback(() => {
    if (settingsRef.current) return;
    // On a phone, the next flip is the book opening again.
    if (closedRef.current) {
      reopen();
      return;
    }

    closedRef.current = true;
    closedAtRef.current = Date.now();
    pausedRef.current = true;
    setFlash(true);
    setTimeout(() => setFlash(false), SLAM_MS);

    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0.5, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    shut.setValue(0);
    Animated.timing(shut, { toValue: 1, duration: SLAM_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();

    const hit = sim.kill();
    if (hit) {
      const { previousLevel, caption } = applyKill(hit);
      setClosed({ hit: true, caption, kills: killsRef.current, level: sim.level, previousLevel });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } else {
      const previousLevel = sim.level;
      nextQuote();
      missesRef.current += 1;
      changeLevel(previousLevel - 1);
      setSplat(null);
      setClosed({
        hit: false,
        caption: MISS_CAPTIONS[(missesRef.current - 1) % MISS_CAPTIONS.length],
        kills: killsRef.current,
        level: sim.level,
        previousLevel,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [sim, shake, shut, reopen, applyKill, changeLevel, nextQuote]);

  const { source } = useSlam(onSlam, reopen);

  // On a foldable the book can only be reopened by opening the device: no tapping the
  // outer screen, no button. The window growing back to the inner display counts too,
  // in case no hinge event arrives while the device is closed.
  const onFoldable = source === 'hinge';
  const outerScreen = onFoldable && !wide;
  const wasWide = useRef(wide);
  useEffect(() => {
    if (wide && !wasWide.current && onFoldable) reopen();
    wasWide.current = wide;
  }, [wide, onFoldable, reopen]);

  // Without a hinge there is no book to shut, so the player swats the fly by touching it.
  const [toast, setToast] = useState<{ caption: string; id: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringId = useRef(0);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const onTouchStart = useCallback(
    (e: { nativeEvent: { pageX: number; pageY: number } }) => {
      if (settingsRef.current || closedRef.current || pausedRef.current || !sim.isOnScreen()) return;
      const { pageX, pageY } = e.nativeEvent;
      // The tap has to land on the middle of the fly; a near miss leaves a ring so you can see how far off it was.
      if (Math.hypot(pageX - sim.x, pageY - sim.y) > sim.hitRadius(flySize)) {
        const id = ++ringId.current;
        setRings((r) => [...r.slice(-3), { id, x: pageX, y: pageY }]);
        setTimeout(() => setRings((r) => r.filter((ring) => ring.id !== id)), 500);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const hit = sim.kill();
      if (!hit) return;
      const { caption } = applyKill(hit);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setToast({ caption, id: splatId.current });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    },
    [sim, flySize, applyKill],
  );
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  const hint = onFoldable
    ? 'Shut the book while the fly is on the page, or tap it dead centre.'
    : 'Tap the fly dead centre to swat it. Or flip your phone shut.';
  const panel = toast ? (
    <Sticky title="THE FLY'S LAST WORDS" caption={toast.caption} tilt={-1} wide={wide} />
  ) : (
    <>
      <Text style={wide ? styles.hintWide : styles.hint}>{hint}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={openSettings} style={styles.settingsPill}>
        <Text style={[styles.settingsText, wide && { color: colors.goldText }]}>Difficulty: {difficultyInfo(difficulty).label} ›</Text>
      </Pressable>
    </>
  );

  return (
    <Animated.View
      onTouchStart={onTouchStart}
      style={[styles.root, { backgroundColor: wide ? colors.walnut : colors.paper, transform: [{ translateX: shakeX }] }]}
    >
      {wide ? (
        <>
          <WalnutBackdrop />
          <View style={{ alignItems: 'center', paddingTop: bookTop }}>
            <OpenBook width={bookW} height={bookH} revenge={kills} level={level} quote={quote} shut={shut} />
          </View>
          <View style={[styles.barWide, { width: bookW }]}>{panel}</View>
        </>
      ) : (
        <>
          <PaperBackdrop width={width} height={height} />
          <PhonePage revenge={kills} level={level} quote={quote} />
          <View style={styles.panel}>{panel}</View>
        </>
      )}

      {splat && !closed && <Splat key={splat.id} x={splat.x} y={splat.y} size={splatSize} delay={100} />}
      <FlyView pos={pos} rot={rot} size={flySize} />
      {rings.map((r) => (
        <TapRing key={r.id} x={r.x} y={r.y} />
      ))}
      {wide && flash && <ThumpFlash />}
      {settingsOpen && <SettingsSheet difficulty={difficulty} wide={wide} onChange={chooseDifficulty} onClose={closeSettings} />}
      {closed && <ClosedCover result={closed} wide={wide} tapToOpen={!outerScreen} onOpen={reopen} />}

      {__DEV__ && !closed && <Hud source={source} mode={mode} light={wide} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  panel: { paddingTop: 14, paddingBottom: 36, paddingLeft: 48, paddingRight: 34, gap: 12, alignItems: 'stretch' },
  barWide: {
    alignSelf: 'center',
    marginTop: 22,
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  hint: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 21, textAlign: 'center', color: colors.hint },
  settingsPill: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
  settingsText: { fontFamily: fonts.serifSemi, fontSize: 14, letterSpacing: 1.4, color: colors.burgundy, textTransform: 'uppercase' },
  hintWide: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.onWalnut },
  hud: { position: 'absolute', left: 12, bottom: 10, fontFamily: fonts.sans, fontSize: 10, opacity: 0.6 },
});
