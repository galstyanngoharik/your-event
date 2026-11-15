import { api } from '../../services/api';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTaskPayload {
  eventId: number;
  title: string;
}

export interface UpdateTaskPayload {
  eventId: number;
  taskId: number;
  completed: boolean;
}

export interface DeleteTaskPayload {
  eventId: number;
  taskId: number;
}

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], number>({
      query: (eventId) => `/events/${eventId}/tasks`,
      providesTags: ['Tasks'],
    }),

    createTask: builder.mutation<Task, CreateTaskPayload>({
      query: ({ eventId, title }) => ({
        url: `/events/${eventId}/tasks`,
        method: 'POST',
        body: { title }
      }),
      invalidatesTags: ['Tasks'],
    }),

    updateTask: builder.mutation<Task, UpdateTaskPayload>({
      query: ({ eventId, taskId, completed }) => ({
        url: `/events/${eventId}/tasks/${taskId}`,
        method: 'PATCH',
        body: { completed }
      }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTask: builder.mutation<void, DeleteTaskPayload>({
      query: ({ eventId, taskId }) => ({
        url: `/events/${eventId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;