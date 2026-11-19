import { api } from '../../services/api';

export interface TimelinePayload {
  title: string;
  startTime: string;
  endTime: string | null;
  description: string | null;
  location: string | null;
}
export interface TimelineActivity extends TimelinePayload {
  id: number;
  eventId: number;
  createdAt: string;
  updatedAt: string;
}

export const timelineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTimeline: builder.query<TimelineActivity[], number>({
      query: (eventId) => `/events/${eventId}/timeline`,
      providesTags: (_result, _error, eventId) => [{ type: 'Timeline', id: eventId }],
    }),
    createTimelineActivity: builder.mutation<TimelineActivity, { eventId: number; data: TimelinePayload }>({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/timeline`, method: 'POST', body: data }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Timeline', id: eventId }],
    }),
    updateTimelineActivity: builder.mutation<TimelineActivity, { eventId: number; activityId: number; data: TimelinePayload }>({
      query: ({ eventId, activityId, data }) => ({ url: `/events/${eventId}/timeline/${activityId}`, method: 'PATCH', body: data }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Timeline', id: eventId }],
    }),
    deleteTimelineActivity: builder.mutation<void, { eventId: number; activityId: number }>({
      query: ({ eventId, activityId }) => ({ url: `/events/${eventId}/timeline/${activityId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Timeline', id: eventId }],
    }),
  }),
});
export const { useGetTimelineQuery, useCreateTimelineActivityMutation, useUpdateTimelineActivityMutation, useDeleteTimelineActivityMutation } = timelineApi;
