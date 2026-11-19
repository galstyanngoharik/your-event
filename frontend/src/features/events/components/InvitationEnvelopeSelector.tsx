import { Check, ChevronDown } from 'lucide-react';
import InvitationEnvelopeImage from '../../../components/invitations/InvitationEnvelopeImage';
import { invitationEnvelopes } from '../invitationEnvelopes';
import type { InvitationEnvelopeId } from '../invitationEnvelopes';

export default function InvitationEnvelopeSelector({ value, onChange }: {
  value: InvitationEnvelopeId;
  onChange: (envelope: InvitationEnvelopeId) => void;
}) {
  return (
    <details className="group rounded-xl border border-[#D9A3AA]/40 text-[#351018]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#D9A3AA] [&::-webkit-details-marker]:hidden">
        Choose Envelope
        <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {invitationEnvelopes.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id}
            className={`relative overflow-hidden rounded-lg border-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#D9A3AA] ${value === id ? 'border-[#351018]' : 'border-transparent hover:border-[#D9A3AA]'}`}>
            <span className="block aspect-[1270/710] w-full"><InvitationEnvelopeImage envelope={id} /></span>
            <span className="flex min-h-12 items-center justify-center bg-[#FFF8F1] px-1 py-2 text-xs">{label}</span>
            {value === id && <span className="absolute right-1 top-1 rounded-full bg-[#351018] p-1 text-white"><Check size={14} /></span>}
          </button>
        ))}
      </div>
    </details>
  );
}
