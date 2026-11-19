
import { api } from '../../services/api';
import type { ServiceFilters } from '../services/servicesApi';
import type { User } from '../../types/auth';

export interface ProviderProfile {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  businessName: string | null;
  workingCities: string[];
  instagram?: string | null;
  phoneNumber?: string | null;
}

export interface ProviderProfileUpdate {
  name: string;
  avatar: string | null;
  bio: string | null;
  businessName: string | null;
  workingCities: string[];
  instagram: string | null;
  phoneNumber: string | null;
}

export type ProviderSearchResult = ProviderProfile;

export interface PortfolioItem {
  id: number;
  providerId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  organizer?: { name: string };
}

export interface OwnProviderReview extends ProviderReview {
  providerId: number;
  organizerId: number;
}

export interface ProviderReviewSummary {
  averageRating: number;
  reviewCount: number;
  reviews: ProviderReview[];
}

export interface ReviewPayload {
  rating: number;
  comment: string | null;
}

export const providersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchProviders: builder.query<ProviderSearchResult[], string | ServiceFilters>({
      query: (search) => ({
        url: '/providers',
        params: typeof search === 'string' ? { search } : { ...search, catalog: 'true' },
      }),
      providesTags: ['Providers', 'Services'],
    }),
    getProvider: builder.query<ProviderProfile, number>({
      query: (id) => `/providers/${id}`,
      providesTags: ['Providers'],
    }),
    updateProviderProfile: builder.mutation<User, ProviderProfileUpdate>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User', 'Providers'],
    }),
    uploadProviderAvatar: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({
        url: '/uploads',
        method: 'POST',
        body,
      }),
    }),
    getProviderPortfolio: builder.query<PortfolioItem[], number>({
      query: (providerId) => `/providers/${providerId}/portfolio`,
      providesTags: (_result, _error, providerId) => [
        { type: 'Portfolio', id: providerId },
      ],
    }),
    uploadPortfolioItem: builder.mutation<PortfolioItem, FormData>({
      query: (body) => ({
        url: '/providers/me/portfolio',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Portfolio'],
    }),
    updatePortfolioItem: builder.mutation<PortfolioItem, { id: number; data: { caption?: string | null; position?: number } }>({
      query: ({ id, data }) => ({
        url: `/providers/me/portfolio/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Portfolio'],
    }),
    deletePortfolioItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/providers/me/portfolio/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Portfolio'],
    }),
    getProviderReviews: builder.query<ProviderReviewSummary, number>({
      query: (providerId) => `/providers/${providerId}/reviews`,
      providesTags: (_result, _error, providerId) => [
        { type: 'Reviews', id: providerId },
      ],
    }),
    getMyProviderReview: builder.query<OwnProviderReview | null, number>({
      query: (providerId) => `/providers/${providerId}/reviews/mine`,
      providesTags: (_result, _error, providerId) => [
        { type: 'Reviews', id: providerId },
      ],
    }),
    createProviderReview: builder.mutation<OwnProviderReview, { providerId: number; data: ReviewPayload }>({
      query: ({ providerId, data }) => ({
        url: `/providers/${providerId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { providerId }) => [
        'Reviews',
        { type: 'Reviews', id: providerId },
      ],
    }),
    updateProviderReview: builder.mutation<OwnProviderReview, { id: number; providerId: number; data: ReviewPayload }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { providerId }) => [
        'Reviews',
        { type: 'Reviews', id: providerId },
      ],
    }),
    deleteProviderReview: builder.mutation<void, { id: number; providerId: number }>({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { providerId }) => [
        'Reviews',
        { type: 'Reviews', id: providerId },
      ],
    }),
  }),
});

export const {
  useSearchProvidersQuery,
  useGetProviderQuery,
  useUpdateProviderProfileMutation,
  useUploadProviderAvatarMutation,
  useGetProviderPortfolioQuery,
  useUploadPortfolioItemMutation,
  useUpdatePortfolioItemMutation,
  useDeletePortfolioItemMutation,
  useGetProviderReviewsQuery,
  useGetMyProviderReviewQuery,
  useCreateProviderReviewMutation,
  useUpdateProviderReviewMutation,
  useDeleteProviderReviewMutation,
} = providersApi;
