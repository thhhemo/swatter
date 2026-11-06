import { useEffect, useRef, useState } from 'react';
import { addHingeListener, getHinge } from 'expo-hinge';
import { Gyroscope } from 'expo-sensors';
import { FlipDetector, HingeSlamDetector } from './detectors';

export type SlamSource = 'hinge' | 'gyro';

/**
 * Calls `onSlam` when the book is shut: the hinge closing on a foldable, or a quick
 * flip of the phone (gyroscope) when no hinge is ever reported. `onOpen` fires when the
 * hinge is opened again; on a phone the next flip calls `onSlam` again, so the caller
 * treats that as the reopening.
 */
export function useSlam(onSlam: () => void, onOpen?: () => void): { source: SlamSource } {
  const callback = useRef(onSlam);
  callback.current = onSlam;
  const openCallback = useRef(onOpen);
  openCallback.current = onOpen;

  const [hingeSeen, setHingeSeen] = useState(() => getHinge() !== null);

  useEffect(() => {
    const detector = new HingeSlamDetector();
    const first = getHinge();
    if (first) detector.updateEvent(first);
    const sub = addHingeListener(({ hinge }) => {
      if (hinge) setHingeSeen(true);
      const event = detector.updateEvent(hinge);
      if (event === 'slam') callback.current();
      else if (event === 'open') openCallback.current?.();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (hingeSeen) return;
    const detector = new FlipDetector();
    Gyroscope.setUpdateInterval(20);
    const sub = Gyroscope.addListener(({ y }) => {
      if (detector.update(y, Date.now())) callback.current();
    });
    return () => sub.remove();
  }, [hingeSeen]);

  return { source: hingeSeen ? 'hinge' : 'gyro' };
}
