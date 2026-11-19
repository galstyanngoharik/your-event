import { useState } from 'react';
import { Expand, Move, RotateCw, Scaling, Trash2 } from 'lucide-react';
import { useDeleteMoodboardItemMutation, useUpdateMoodboardCaptionMutation } from '../../features/events/moodboardApi';
import type { MoodboardItem, MoodboardPlacement } from '../../features/events/moodboardApi';
import { serviceImage } from '../../features/services/servicesApi';
import { useMoodboardDrag } from '../../hooks/useMoodboardDrag';

export default function MoodboardPhoto({ item, placement, zoom, update, persist, front, preview, setError }: {
  item: MoodboardItem; placement: MoodboardPlacement; zoom: number;
  update: (placement: MoodboardPlacement) => void; persist: () => void; front: () => number;
  preview: (item: MoodboardItem) => void; setError: (message: string) => void;
}) {
  const [caption, setCaption] = useState<string | null>(null);
  const [updateCaption, { isLoading: saving }] = useUpdateMoodboardCaptionMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteMoodboardItemMutation();
  const { start, ...drag } = useMoodboardDrag(placement, zoom, update, persist, front);
  const saveCaption = async () => {
    try {
      await updateCaption({ eventId: item.eventId, itemId: item.id, caption: (caption ?? item.caption ?? '').trim() || null }).unwrap();
      setCaption(null);
    } catch { setError('Could not save the caption.'); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this inspiration image?')) return;
    try { await deleteItem({ eventId: item.eventId, itemId: item.id }).unwrap(); }
    catch { setError('Could not delete the image.'); }
  };
  return (
    <article data-board-card className="absolute origin-top-left select-none bg-white p-3 pb-5 text-[#351018] shadow-lg"
      style={{ left: placement.x, top: placement.y, width: placement.width, zIndex: placement.zIndex, transform: `rotate(${placement.rotation}deg)` }}>
      <div className="absolute -top-2 left-1/2 h-5 w-5 rounded-full border-4 border-[#D9A3AA] bg-[#351018] shadow-md" />
      <div {...drag} onPointerDown={(event) => start(event)} className="touch-none cursor-grab active:cursor-grabbing">
        <img draggable={false} src={serviceImage(item.imageUrl) || ''} alt={item.caption || 'Event inspiration'} className="pointer-events-none aspect-[4/3] w-full object-cover" />
        <p className="mt-3 min-h-10 whitespace-pre-wrap break-words text-sm">{item.caption}</p>
      </div>
      <div data-export-ignore className="absolute left-0 top-full w-full space-y-2 rounded-b-lg border-t border-[#F2D9DC] bg-white p-3 shadow-lg">
        <label className="block text-xs">Caption
          <input value={caption ?? item.caption ?? ''} onChange={(event) => setCaption(event.target.value)} maxLength={250}
            className="mt-1 w-full rounded border border-[#351018]/15 p-1 text-sm outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={saveCaption} disabled={saving} className="text-xs underline disabled:opacity-50">{saving ? 'Saving...' : 'Save Caption'}</button>
          <button onClick={() => preview(item)} aria-label="Preview image"><Expand size={16} /></button>
          <button onClick={remove} disabled={deleting} aria-label="Delete inspiration image"><Trash2 size={16} /></button>
          <button {...drag} onPointerDown={(event) => start(event)} aria-label="Move photo" className="touch-none cursor-move"><Move size={16} /></button>
          <button {...drag} onPointerDown={(event) => start(event, 'rotate')} aria-label="Rotate photo" className="touch-none cursor-grab"><RotateCw size={16} /></button>
          <button {...drag} onPointerDown={(event) => start(event, 'resize')} aria-label="Resize photo" className="touch-none cursor-nwse-resize"><Scaling size={16} /></button>
        </div>
      </div>
    </article>
  );
}
