import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function MessageImagePreview({ source, name, close }: {
  source: string; name: string; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <dialog ref={dialog} onCancel={close} aria-label="Message image preview"
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      className="fixed inset-0 m-auto max-h-[95vh] max-w-[95vw] bg-transparent p-6 backdrop:bg-black/85">
      <button type="button" autoFocus onClick={close} aria-label="Close image preview" className="absolute right-0 top-0 rounded-full bg-[#351018] p-2 text-white"><X size={20} /></button>
      <img src={source} alt={name} className="max-h-[85vh] max-w-full object-contain" />
    </dialog>
  );
}
