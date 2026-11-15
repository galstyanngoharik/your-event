
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
  sender?: {
    id: number;
    name: string;
  };
}

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

    sendMessage: builder.mutation<
      Message,
      { conversationId: number; body: string }
    >({
      query: ({ conversationId, body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { body },
      }),
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
} = messagesApi;
