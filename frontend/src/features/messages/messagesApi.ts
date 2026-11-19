
import { api } from '../../services/api';

export interface ChatUser {
  id: number;
  name: string;
  avatar: string | null;
  businessName?: string | null;
}

export interface Conversation {
  id: number;
  organizerId: number;
  providerId: number;
  organizer?: ChatUser;
  provider?: ChatUser;
  updatedAt: string;
  messages?: Pick<Message, 'body' | 'createdAt' | 'senderId'>[];
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  createdAt: string;
  readAt: string | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  attachment?: {
    url: string;
    name: string;
    mime: string;
    size: number;
    type: 'image' | 'video' | 'audio';
    duration?: number | null;
  } | null;
  sender?: {
    id: number;
    name: string;
  };
}

const replaceMessage = (messages: Message[], incoming: Message) => {
  const index = messages.findIndex((message) => message.id === incoming.id);
  if (index >= 0) messages[index] = incoming;
};

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => '/conversations',
      providesTags: ['Conversations'],
    }),

    createConversation: builder.mutation<
      Conversation,
      { providerId: number }
    >({
      query: (body) => ({
        url: '/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),

    getMessages: builder.query<Message[], number>({
      query: (conversationId) =>
        `/conversations/${conversationId}/messages`,
      providesTags: (_result, _error, id) => [
        { type: 'Messages', id },
      ],
    }),

    editMessage: builder.mutation<Message, { conversationId: number; messageId: number; body: string }>({
      query: ({ conversationId, messageId, body }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}`,
        method: 'PATCH',
        body: { body },
      }),
      async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(messagesApi.util.updateQueryData('getMessages', conversationId, (draft) => {
            replaceMessage(draft, data);
          }));
        } catch { return; }
      },
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Messages', id: conversationId }, 'Conversations'],
    }),
    deleteMessage: builder.mutation<Message, { conversationId: number; messageId: number }>({
      query: ({ conversationId, messageId }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(messagesApi.util.updateQueryData('getMessages', conversationId, (draft) => {
            replaceMessage(draft, data);
          }));
        } catch { return; }
      },
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Messages', id: conversationId }, 'Conversations'],
    }),
    sendMessage: builder.mutation<
      Message,
      { conversationId: number; body: string; attachment?: File }
    >({
      query: ({ conversationId, body, attachment }) => {
        if (!attachment) return { url: `/conversations/${conversationId}/messages`, method: 'POST', body: { body } };
        const formData = new FormData();
        formData.append('body', body);
        formData.append('attachment', attachment);
        return { url: `/conversations/${conversationId}/messages`, method: 'POST', body: formData };
      },
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations',
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = messagesApi;
