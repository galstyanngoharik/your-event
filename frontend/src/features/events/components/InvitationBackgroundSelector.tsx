import { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { backgroundTemplates } from '../invitationBackgrounds';
import type { InvitationBackgroundTemplate } from '../invitationBackgrounds';

export default function InvitationBackgroundSelector({ value, onChange }: {
  value: InvitationBackgroundTemplate | null;
  onChange: (template: InvitationBackgroundTemplate | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const galleryId = useId();

  return (
    <section className="rounded-xl border border-[#D9A3AA]/40 text-[#351018]">
      <button type="button" aria-expanded={expanded} aria-controls={galleryId}
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#D9A3AA]">
        Choose Background Template
        <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div id={galleryId} inert={!expanded} aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 px-4 pb-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {backgroundTemplates.map(({ id, image }, index) => (
                <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id}
                  aria-label={`Select background template ${index + 1}`}
                  className={`relative overflow-hidden rounded-lg border-2 bg-[#FFF8F1] p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#D9A3AA] ${value === id ? 'border-[#351018]' : 'border-transparent hover:border-[#D9A3AA]'}`}>
                  <img src={image} alt={`Background template ${index + 1}`} loading="lazy" className="aspect-[3/4] w-full object-contain" />
                  {value === id && <span className="absolute right-1 top-1 rounded-full bg-[#351018] p-1 text-white"><Check size={14} /></span>}
                </button>
              ))}
            </div>
            {value && <button type="button" onClick={() => onChange(null)} className="text-xs underline underline-offset-4">Remove background template</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
