import { useState } from 'react';
import type { MoodboardData, MoodboardItem } from '../../features/events/moodboardApi';
import { useMoodboardLayout } from '../../hooks/useMoodboardLayout';
import { useMoodboardExport } from '../../hooks/useMoodboardExport';
import MoodboardPhoto from './MoodboardPhoto';
import MoodboardSwatch from './MoodboardSwatch';
import MoodboardPreview from './MoodboardPreview';

export default function MoodboardCanvas({ eventId, data, colors, removeColor, setError }: {
  eventId: number; data: MoodboardData; colors: string[];
  removeColor: (color: string) => void; setError: (message: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<MoodboardItem | null>(null);
  const board = useMoodboardLayout(eventId, { ...data, colors }, setError);
  const { boardRef, isExporting, saveImage } = useMoodboardExport(eventId, setError);
  const entries = [
    ...data.items.map((item, index) => board.getPlacement(`photo-${item.id}`, index)),
    ...colors.map((color, index) => board.getPlacement(`color-${color.toUpperCase()}`, data.items.length + index)),
  ];
  const width = Math.max(1200, ...entries.map((p) => p.x + p.width + 400));
  const height = Math.max(900, ...entries.map((p) => p.y + p.width + 500));
  return (
    <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5 text-[#351018]">
      <h2 className="text-lg font-semibold">Inspiration Board</h2>
      <p className="text-sm text-[#351018]/60">Drag photos and colors freely. Use the photo handles to resize or rotate.</p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button onClick={() => setZoom((value) => Math.max(0.25, value - 0.1))} disabled={zoom <= 0.25} aria-label="Zoom out">−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((value) => Math.min(2, value + 0.1))} disabled={zoom >= 2} aria-label="Zoom in">+</button>
        <button onClick={board.persist} className="rounded-xl border border-[#351018]/20 px-3 py-2">{board.dirty ? 'Save Layout •' : 'Save Layout'}</button>
        <button onClick={saveImage} disabled={isExporting || entries.length === 0} className="rounded-xl bg-[#351018] px-4 py-2 text-white disabled:opacity-50">
          {isExporting ? 'Saving Image...' : 'Save as Image'}
        </button>
      </div>
      <div className="max-h-[75vh] overflow-auto rounded-xl border border-[#D9A3AA]/30 bg-[#FFF8F1]">
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div ref={boardRef} data-theme-preserve className="relative origin-top-left overflow-hidden bg-[#FFF8F1] text-[#351018]" style={{ width, height, transform: `scale(${zoom})` }}>
            {entries.length === 0 && <p className="p-10 text-sm text-[#351018]/60">Add photos and colors to start your moodboard.</p>}
            {data.items.map((item, index) => {
              const key = `photo-${item.id}`;
              return <MoodboardPhoto key={key} item={item} placement={board.getPlacement(key, index)} zoom={zoom}
                update={(placement) => board.update(key, placement)} persist={board.persist} front={board.front} preview={setSelected} setError={setError} />;
            })}
            {colors.map((color, index) => {
              const key = `color-${color.toUpperCase()}`;
              return <MoodboardSwatch key={key} color={color} placement={board.getPlacement(key, data.items.length + index)} zoom={zoom}
                update={(placement) => board.update(key, placement)} persist={board.persist} front={board.front} remove={() => removeColor(color)} />;
            })}
          </div>
        </div>
      </div>
      {selected && <MoodboardPreview item={selected} close={() => setSelected(null)} />}
    </section>
  );
}
