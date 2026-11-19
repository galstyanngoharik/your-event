import InvitationEnvelopeImage from './InvitationEnvelopeImage';
import type { InvitationEnvelopeId } from '../../features/events/invitationEnvelopes';
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';

export default function InvitationEnvelope({ children, background, envelope: envelopeId }: { children: ReactNode; background?: ReactNode; envelope?: InvitationEnvelopeId | null }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const envelope = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const reveal = () => {
    setOpen(true);
    requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
  };

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => envelope.current?.focus({ preventScroll: true }));
  };

  return (
    <div data-theme-preserve className="isolate grid w-full overflow-x-clip text-[#351018]">
      <div aria-hidden={open} inert={open}
        className={`col-start-1 row-start-1 grid transition-[grid-template-rows,opacity,transform] duration-700 ease-in-out motion-reduce:transform-none motion-reduce:transition-none ${open ? 'pointer-events-none translate-y-12 grid-rows-[0fr] opacity-0' : 'translate-y-0 grid-rows-[1fr] opacity-100'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="flex min-h-svh items-center justify-center">
            <button ref={envelope} type="button" onClick={reveal} aria-label="Open invitation"
              aria-expanded={open} aria-controls={contentId} aria-describedby={`${contentId}-hint`}
              className="group relative block h-svh w-full cursor-pointer overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#C6A664]">
              <InvitationEnvelopeImage envelope={envelopeId}
                className="block h-full w-full transition-[filter] duration-500 group-hover:brightness-110 group-focus-visible:brightness-110 motion-reduce:transition-none" />
              <span id={`${contentId}-hint`} className="pointer-events-none absolute inset-x-4 bottom-8 flex justify-center sm:bottom-10">
                <span className="rounded-full border border-[#C6A664]/40 bg-[#351018]/80 px-5 py-3 text-sm tracking-wide text-[#FFF8F1]">
                  Click to open
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <div id={contentId} aria-hidden={!open} inert={!open}
        className={`col-start-1 row-start-1 grid transition-[grid-template-rows,opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${open ? 'translate-y-0 grid-rows-[1fr] opacity-100 delay-150 motion-reduce:delay-0' : 'pointer-events-none translate-y-20 grid-rows-[0fr] opacity-0'}`}>
        <div className="relative isolate min-h-0 overflow-hidden">
          {background}
          <div className="relative mx-auto min-h-svh w-full max-w-2xl space-y-4 px-4 py-8 sm:px-6">
            <div className="flex justify-end">
              <button ref={closeButton} type="button" onClick={close}
                className="inline-flex items-center gap-2 rounded-full border border-[#C6A664]/50 bg-[#FFF8F1] px-4 py-2 text-sm text-[#351018] outline-none hover:bg-[#F2D9DC] focus-visible:ring-2 focus-visible:ring-[#C6A664]">
                <Mail size={16} /> Close invitation
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
