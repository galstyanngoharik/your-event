import { api } from '../../services/api';

export interface Notification {
  id: number;
  recipientId: number;
  type: 'message' | 'conversation_update' | 'rsvp' | 'event_reminder' | 'task_reminder';
  title: string;
  description: string;
  entityId: number | null;
  link: string;
  readAt: string | null;
  createdAt: string;
}
export interface NotificationsData {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsData, { offset: number }>({
      query: ({ offset }) => ({ url: '/notifications', params: { offset, limit: 20 } }),
      providesTags: ['Notifications'],
    }),
    readNotification: builder.mutation<Notification, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
    readAllNotifications: builder.mutation<{ updated: number }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useReadNotificationMutation, useReadAllNotificationsMutation } = notificationsApi;
