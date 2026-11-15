import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import type { PortfolioItem } from './providersApi';
import { serviceImage } from '../services/servicesApi';

interface Props {
  items: PortfolioItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export default function PortfolioGallery({ items, isLoading, isError, onRetry }: Props) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

  return (
    <>
      {isLoading ? (
        <p className="text-sm text-[#351018]/60">Loading portfolio...</p>
      ) : isError ? (
        <p className="text-sm text-red-600">
          Failed to load portfolio.{' '}
          {onRetry && <button onClick={onRetry} className="underline">Try again</button>}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#351018]/60">No portfolio items yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const src = serviceImage(item.mediaUrl) || '';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                aria-label={`View ${item.mediaType === 'video' ? 'video' : 'photo'}${item.caption ? `: ${item.caption}` : ''}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F2D9DC]/40 text-left"
              >
                {item.mediaType === 'image' ? (
                  <img src={src} alt={item.caption || 'Provider portfolio work'} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
                ) : (
                  <>
                    <video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-[#351018]/20 text-white">
                      <Play size={42} className="fill-white" />
                    </span>
                  </>
                )}
                {item.caption && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-sm text-white">
                    {item.caption}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.caption || 'Portfolio preview'}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close preview"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={24} />
          </button>
          <div className="flex max-h-full max-w-full flex-col items-center gap-3">
            {selected.mediaType === 'image' ? (
              <img src={serviceImage(selected.mediaUrl) || ''} alt={selected.caption || 'Provider portfolio work'} className="max-h-[85vh] max-w-[92vw] object-contain" />
            ) : (
              <video src={serviceImage(selected.mediaUrl) || ''} controls playsInline className="max-h-[85vh] max-w-[92vw]" />
            )}
            {selected.caption && <p className="max-w-[92vw] text-center text-sm text-white">{selected.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}