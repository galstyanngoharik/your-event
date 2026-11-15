
import { api } from '../../services/api';

export interface Favorite {
  id: number;
  serviceId: number;
  Service: {
    id: number;
    title: string;
    category: string;
    description: string | null;
    city: string;
    price: string;
    images: string[];
  } | null;
}

export const favoritesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<Favorite[], void>({
      query: () => '/favorites',
      providesTags: ['Favorites'],
    }),

    addFavorite: builder.mutation<Favorite, number>({
      query: (serviceId) => ({
        url: `/favorites/${serviceId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites'],
    }),

    removeFavorite: builder.mutation<void, number>({
      query: (serviceId) => ({
        url: `/favorites/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
