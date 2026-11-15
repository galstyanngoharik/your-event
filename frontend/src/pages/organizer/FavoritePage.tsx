
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import {
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from '../../features/services/favoritesApi';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading, isError, refetch } =
    useGetFavoritesQuery();

  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveFavoriteMutation();

  const handleRemove = async (serviceId: number) => {
    try {
      await removeFavorite(serviceId).unwrap();
    } catch {
      alert('Failed to remove service.');
    }
  };

  if (isLoading) return <p>Loading saved services...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#351018]">
          Saved Services
        </h1>
        <p className="text-sm text-gray-500">
          Your favorite services in one place.
        </p>
      </div>

      {isError ? (
        <div className="rounded-2xl bg-white p-8">
          <p className="text-red-600">Failed to load saved services.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm underline"
          >
            Try again
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center">
          <Heart size={36} className="mx-auto text-[#351018]" />
          <h2 className="mt-4 font-semibold">No saved services yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Explore services and save your favorites.
          </p>
          <Link
            to="/organizer/services"
            className="mt-5 inline-block rounded-xl bg-[#351018] px-5 py-3 text-sm text-white"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => {
            const service = favorite.Service;
            if (!service) return null;

            return (
              <div
                key={favorite.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="space-y-3 p-5">
                  <p className="text-xs text-gray-500">
                    {service.category}
                  </p>

                  <h2 className="text-lg font-semibold text-[#351018]">
                    {service.title}
                  </h2>

                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    {service.city}
                  </p>

                  <p className="font-semibold text-[#351018]">
                    {Number(service.price).toLocaleString()} AMD
                  </p>

                  <div className="flex gap-3 pt-3">
                    <Link
                      to={`/organizer/services/${service.id}`}
                      className="flex-1 rounded-xl bg-[#351018] px-4 py-2 text-center text-sm text-white"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => handleRemove(service.id)}
                      disabled={isRemoving}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
