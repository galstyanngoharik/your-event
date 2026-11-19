import { useRef } from 'react';
import type { PointerEvent } from 'react';
import type { MoodboardPlacement } from '../features/events/moodboardApi';

type Mode = 'move' | 'resize' | 'rotate';
interface Gesture {
  pointerId: number;
  x: number;
  y: number;
  start: MoodboardPlacement;
  mode: Mode;
  angle: number;
  centerX: number;
  centerY: number;
  height: number;
}

export function useMoodboardDrag(placement: MoodboardPlacement, zoom: number,
  update: (placement: MoodboardPlacement) => void, persist: () => void, front: () => number) {
  const gesture = useRef<Gesture | null>(null);
  const start = (event: PointerEvent<HTMLElement>, mode: Mode = 'move') => {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget.closest('[data-board-card]') as HTMLElement;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const next = { ...placement, zIndex: front() };
    gesture.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: next, mode,
      angle: Math.atan2(event.clientY - centerY, event.clientX - centerX), centerX, centerY, height: card.offsetHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    update(next);
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = (event.clientX - active.x) / zoom;
    const dy = (event.clientY - active.y) / zoom;
    const next = { ...active.start };
    if (active.mode === 'move') {
      next.x = Math.max(40, Math.min(5000, next.x + dx));
      next.y = Math.max(40, Math.min(5000, next.y + dy));
    } else if (active.mode === 'resize') {
      const radians = next.rotation * Math.PI / 180;
      next.width = Math.max(120, Math.min(600, next.width + dx * Math.cos(radians) + dy * Math.sin(radians)));
    } else {
      const angle = Math.atan2(event.clientY - active.centerY, event.clientX - active.centerX);
      next.rotation = ((next.rotation + (angle - active.angle) * 180 / Math.PI + 540) % 360) - 180;
    }
    const radians = next.rotation * Math.PI / 180;
    const height = active.height + (next.width - active.start.width) * 0.75;
    const corners = [[0, 0], [next.width, 0], [0, height], [next.width, height]];
    next.x = Math.max(next.x, 20 - Math.min(...corners.map(([x, y]) => x * Math.cos(radians) - y * Math.sin(radians))));
    next.y = Math.max(next.y, 20 - Math.min(...corners.map(([x, y]) => x * Math.sin(radians) + y * Math.cos(radians))));
    update(next);
  };
  const end = (event: PointerEvent<HTMLElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    persist();
  };
  return { start, onPointerMove: move, onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end };
}
