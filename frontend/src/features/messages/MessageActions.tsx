import { useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default function MessageActions({ canEdit, busy, edit, remove }: {
  canEdit: boolean; busy: boolean; edit: () => void; remove: () => void;
}) {
  const [placement, setPlacement] = useState<'above' | 'below'>('above');
  const menu = useRef<HTMLDetailsElement>(null);
  const action = (callback: () => void) => {
    if (menu.current) menu.current.open = false;
    callback();
  };

  return (
    <details ref={menu} className="ye-message-actions relative" data-placement={placement}
      onToggle={event => {
        if (!event.currentTarget.open) return;
        const top = event.currentTarget.getBoundingClientRect().top;
        const edge = event.currentTarget.closest('.ye-message-history')?.getBoundingClientRect().top ?? 0;
        setPlacement(top - edge > 110 ? 'above' : 'below');
      }}>
      <summary aria-label="Message actions" className="cursor-pointer list-none rounded-md p-1 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#D9A3AA] [&::-webkit-details-marker]:hidden"><MoreHorizontal size={18} /></summary>
      <div className="absolute right-0 top-full z-20 min-w-32 rounded-xl border border-[#D9A3AA]/30 bg-white p-1 text-[#351018] shadow-lg">
        {canEdit && <button type="button" disabled={busy} onClick={() => action(edit)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-[#F2D9DC]/50 disabled:opacity-50"><Pencil size={14} />Edit</button>}
        <button type="button" disabled={busy} onClick={() => action(remove)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-[#F2D9DC]/50 disabled:opacity-50"><Trash2 size={14} />Delete</button>
      </div>
    </details>
  );
}
