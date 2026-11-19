import type { MoodboardPlacement } from '../../features/events/moodboardApi';
import { useMoodboardDrag } from '../../hooks/useMoodboardDrag';

export default function MoodboardSwatch({ color, placement, zoom, update, persist, front, remove }: {
  color: string; placement: MoodboardPlacement; zoom: number; update: (placement: MoodboardPlacement) => void;
  persist: () => void; front: () => number; remove: () => void;
}) {
  const { start, ...drag } = useMoodboardDrag(placement, zoom, update, persist, front);
  return (
    <div data-board-card className="absolute origin-top-left w-36 select-none bg-white p-3 shadow-lg"
      style={{ left: placement.x, top: placement.y, zIndex: placement.zIndex, transform: `rotate(${placement.rotation}deg)` }}>
      <div {...drag} onPointerDown={(event) => start(event)} className="touch-none cursor-grab">
        <img draggable={false} alt={color} className="pointer-events-none h-24 w-full"
          src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="96"><rect width="120" height="96" fill="${color}"/></svg>`)}`} />
        <p className="mt-2 text-center font-mono text-xs text-[#351018]">{color}</p>
      </div>
      <button data-export-ignore onClick={remove} aria-label={`Remove ${color}`} className="absolute -right-2 -top-2 rounded-full bg-white px-2 text-[#351018] shadow">×</button>
    </div>
  );
}
