import { useState } from 'react';
import { Heart } from 'lucide-react';
import {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from './favoritesApi';

export default function SaveServiceButton({ serviceId }: { serviceId: number }) {
  const { data: favorites, isFetching, isError, refetch } = useGetFavoritesQuery();
  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();
  const [error, setError] = useState('');
  const saved = favorites?.some((favorite) => favorite.serviceId === serviceId) ?? false;
  const busy = isFetching || isAdding || isRemoving;
  const label = saved ? 'Remove from Saved Services' : 'Save service';

  const toggle = async () => {
    if (busy || isError || !favorites) return;
    setError('');
    try {
      if (saved) await removeFavorite(serviceId).unwrap();
      else await addFavorite(serviceId).unwrap();
    } catch {
      setError('Could not update Saved Services. Please try again.');
    }
  };

  return (
    <div className="space-y-2">
      <button type="button" onClick={toggle} disabled={busy || isError || !favorites}
        aria-label={label} aria-pressed={saved} title={label}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#D9A3AA] disabled:cursor-not-allowed disabled:opacity-50 ${saved ? 'border-[#D9A3AA] bg-[#F2D9DC]/50 text-[#351018]' : 'border-[#351018]/20 bg-white text-[#351018] hover:bg-[#F2D9DC]/40'}`}>
        <Heart size={20} className={saved ? 'fill-current' : ''} />
        {isAdding || isRemoving ? 'Saving...' : saved ? 'Saved' : 'Save service'}
      </button>
      {isError && <p role="alert" className="text-xs text-red-600">Could not load saved services. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
