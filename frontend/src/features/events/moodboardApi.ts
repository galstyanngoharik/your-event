import { api } from '../../services/api';

export interface MoodboardItem {
  id: number;
  eventId: number;
  imageUrl: string;
  caption: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface MoodboardData {
  items: MoodboardItem[];
  colors: string[];
}

export const moodboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMoodboard: builder.query<MoodboardData, number>({
      query: (eventId) => `/events/${eventId}/moodboard`,
      providesTags: (_result, _error, eventId) => [{ type: 'Moodboards', id: eventId }],
    }),
    uploadMoodboardImage: builder.mutation<MoodboardItem, { eventId: number; formData: FormData }>({
      query: ({ eventId, formData }) => ({
        url: `/events/${eventId}/moodboard`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Moodboards', id: eventId }],
    }),
    updateMoodboardCaption: builder.mutation<MoodboardItem, { eventId: number; itemId: number; caption: string | null }>({
      query: ({ eventId, itemId, caption }) => ({
        url: `/events/${eventId}/moodboard/${itemId}`,
        method: 'PATCH',
        body: { caption },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Moodboards', id: eventId }],
    }),
    reorderMoodboard: builder.mutation<MoodboardItem[], { eventId: number; itemIds: number[] }>({
      query: ({ eventId, itemIds }) => ({
        url: `/events/${eventId}/moodboard/order`,
        method: 'PATCH',
        body: { itemIds },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Moodboards', id: eventId }],
    }),
    deleteMoodboardItem: builder.mutation<void, { eventId: number; itemId: number }>({
      query: ({ eventId, itemId }) => ({
        url: `/events/${eventId}/moodboard/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Moodboards', id: eventId }],
    }),
    saveMoodboardColors: builder.mutation<{ colors: string[] }, { eventId: number; colors: string[] }>({
      query: ({ eventId, colors }) => ({
        url: `/events/${eventId}/moodboard/colors`,
        method: 'PUT',
        body: { colors },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Moodboards', id: eventId }],
    }),
  }),
});

export const {
  useGetMoodboardQuery,
  useUploadMoodboardImageMutation,
  useUpdateMoodboardCaptionMutation,
  useReorderMoodboardMutation,
  useDeleteMoodboardItemMutation,
  useSaveMoodboardColorsMutation,
} = moodboardApi;