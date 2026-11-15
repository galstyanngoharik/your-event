import { api } from '../../services/api';

export interface Guest {
  id: number;
  name: string;
  status: 'pending' | 'going' | 'declined';
}

export interface CreateGuestPayload {
  eventId: number;
  name: string;
}

export interface DeleteGuestPayload {
  eventId: number;
  guestId: number;
}

export const guestsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGuests: builder.query<Guest[], number>({
      query: (eventId) => `/events/${eventId}/guests`,
      providesTags: ['Guests'],
    }),

    createGuest: builder.mutation<Guest, CreateGuestPayload>({
      query: ({ eventId, name }) => ({
       url: `/events/${eventId}/guests`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Guests'],
    }),

    deleteGuest: builder.mutation<void, DeleteGuestPayload>({
      query: ({ eventId, guestId }) => ({
        url: `/events/${eventId}/guests/${guestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Guests'],
    }),
  }),
});

export const {
  useGetGuestsQuery,
  useCreateGuestMutation,
  useDeleteGuestMutation,
} = guestsApi;