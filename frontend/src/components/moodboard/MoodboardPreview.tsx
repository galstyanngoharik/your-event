import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { MoodboardItem } from '../../features/events/moodboardApi';
import { serviceImage } from '../../features/services/servicesApi';

export default function MoodboardPreview({ item, close }: { item: MoodboardItem; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  return (
    <dialog ref={dialog} onCancel={close} aria-label="Moodboard image preview"
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      className="fixed inset-0 m-auto max-h-[95vh] max-w-[95vw] bg-transparent p-6 text-white backdrop:bg-black/85">
      <button autoFocus onClick={close} aria-label="Close image preview" className="absolute right-0 top-0 rounded-full bg-[#351018] p-2"><X /></button>
      <img src={serviceImage(item.imageUrl) || ''} alt={item.caption || 'Event inspiration'} className="max-h-[80vh] max-w-full object-contain" />
      {item.caption && <p className="mt-3 text-center text-sm">{item.caption}</p>}
    </dialog>
  );
}
