import { useState } from 'react';
import type { ChatUser } from './messagesApi';
import { serviceImage } from '../services/servicesApi';

export default function ConversationIdentity({ partner, subtitle, dark = false }: {
  partner?: ChatUser;
  subtitle?: string;
  dark?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const name = partner?.businessName || partner?.name || 'User';
  const source = serviceImage(partner?.avatar || undefined);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();

  return (
    <span className="flex min-w-0 items-center gap-3">
      {source && source !== failedSource ? (
        <img src={source} alt="" onError={() => setFailedSource(source)}
          className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2D9DC] text-sm font-semibold text-[#351018]">
          {initials || 'U'}
        </span>
      )}
      <span className="min-w-0">
        <span className={`block truncate font-medium ${dark ? 'text-white' : 'text-[#351018]'}`}>{name}</span>
        {subtitle && <span className={`mt-1 block text-xs font-normal ${dark ? 'text-white/60' : 'text-gray-500'}`}>{subtitle}</span>}
      </span>
    </span>
  );
}
