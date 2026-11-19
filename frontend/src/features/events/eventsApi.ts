import { api } from '../../services/api';
import type { CurrencyCode } from './currency';
import type { Task } from './tasksApi';
import type { Expense } from './expensesApi';
import type { Guest } from './guestsApi';
import type { Invitation } from './invitationsApi';

export type EventStatus = 'planning' | 'completed' | 'cancelled';

export interface Event {
  id: number;
  title: string;
  type: string;
  description: string;
  date: string;
  city: string;
  address: string;
  budget: number;
  currency: CurrencyCode;
  expectedGuests: number;
  coverImage: string | null;
  status: EventStatus;
  invitation?: Invitation | null;
}

export interface AnalyticsEvent extends Event {
  tasks: Task[];
  expenses: Expense[];
  guests: Guest[];
}

export type EventPayload = Pick<
  Event,
  | 'title'
  | 'type'
  | 'description'
  | 'date'
  | 'city'
  | 'address'
  | 'budget'
  | 'currency'
  | 'expectedGuests'
  | 'status'
>;

export const eventsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardEvents: builder.query<AnalyticsEvent[], void>({
      query: () => '/events?analytics=true',
      providesTags: ['Events', 'Tasks', 'Expenses', 'Guests'],
    }),
    getEvents: builder.query<Event[], void>({
      query: () => '/events',
      providesTags: ['Events'],
    }),

    getEventById: builder.query<Event, number>({
      query: (id) => `/events/${id}`,
      providesTags: ['Events'],
    }),

    createEvent: builder.mutation<Event, EventPayload>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Events'],
    }),

    updateEvent: builder.mutation<
      Event,
      { id: number; data: Partial<EventPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Events'],
    }),

    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),
  }),
});

export const {
  useGetDashboardEventsQuery,
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;