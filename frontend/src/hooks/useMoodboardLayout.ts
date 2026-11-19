import { useRef, useState } from 'react';
import { useSaveMoodboardLayoutMutation } from '../features/events/moodboardApi';
import type { MoodboardData, MoodboardLayout, MoodboardPlacement } from '../features/events/moodboardApi';

export function useMoodboardLayout(eventId: number, data: MoodboardData, setError: (message: string) => void) {
  const [layout, setLayout] = useState<MoodboardLayout>(data.layout || {});
  const current = useRef(layout);
  const revision = useRef(0);
  const [saveLayout] = useSaveMoodboardLayoutMutation();
  const queue = useRef(Promise.resolve());
  const [dirty, setDirty] = useState(false);
  const getPlacement = (key: string, index: number): MoodboardPlacement => current.current[key] || {
    x: 60 + (index % 4) * 280, y: 60 + Math.floor(index / 4) * 360,
    width: 240, rotation: index % 2 === 0 ? -3 : 3, zIndex: index + 1,
  };
  const update = (key: string, placement: MoodboardPlacement) => {
    revision.current += 1;
    current.current = { ...current.current, [key]: placement };
    setLayout(current.current);
    setDirty(true);
  };
  const persist = () => {
    const allowed = new Set([
      ...data.items.map((item) => `photo-${item.id}`),
      ...data.colors.map((color) => `color-${color.toUpperCase()}`),
    ]);
    data.items.forEach((item, index) => {
      const key = `photo-${item.id}`;
      current.current[key] = getPlacement(key, index);
    });
    data.colors.forEach((color, index) => {
      const key = `color-${color.toUpperCase()}`;
      current.current[key] = getPlacement(key, data.items.length + index);
    });
    const savedRevision = revision.current;
    const snapshot = Object.fromEntries(Object.entries(current.current).filter(([key]) => allowed.has(key)));
    queue.current = queue.current.then(async () => {
      try {
        await saveLayout({ eventId, layout: snapshot }).unwrap();
        if (revision.current === savedRevision) setDirty(false);
      } catch {
        setError('Could not save the board layout. Use Save Layout to retry.');
      }
    });
  };
  const front = () => Math.min(999999, Math.max(0, ...Object.values(current.current).map((entry) => entry.zIndex), data.items.length + data.colors.length) + 1);
  return { layout, getPlacement, update, persist, front, dirty };
}
