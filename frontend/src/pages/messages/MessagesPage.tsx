
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '../../features/messages/messagesApi';

export default function MessagesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [params, setParams] = useSearchParams();
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedId = Number(params.get('chat'));
  const conversationId =
    Number.isInteger(selectedId) && selectedId > 0
      ? selectedId
      : null;

  const {
    data: conversations = [],
    isLoading: loadingChats,
    isError: chatsError,
    refetch: refetchChats,
  } = useGetConversationsQuery(undefined, {
    pollingInterval: 10000,
  });

  const selected = conversations.find(
    (conversation) => conversation.id === conversationId
  );

  const {
    data: messages = [],
    isLoading: loadingMessages,
    isError: messagesError,
    refetch: refetchMessages,
  } = useGetMessagesQuery(conversationId || 0, {
    skip: !conversationId || !selected,
    pollingInterval: 5000,
  });

  const [sendMessage, { isLoading: isSending }] =
    useSendMessageMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = (id: number) => {
    setParams({ chat: String(id) });
    setBody('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const text = body.trim();
    if (!text || !conversationId || isSending) return;

    try {
      await sendMessage({ conversationId, body: text }).unwrap();
      setBody('');
    } catch {
      alert('Failed to send message.');
    }
  };

  const home =
    user?.role === 'provider' ? '/provider' : '/organizer';

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <Link
          to={home}
          className="flex items-center gap-2 text-sm text-[#351018]"
        >
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-[#351018]">
          Messages
        </h1>
        <p className="text-sm text-gray-500">
          Communicate with event organizers and service providers.
        </p>
      </div>

      <div className="grid h-[650px] overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid-cols-[280px_1fr]">
        <aside className="overflow-y-auto border-r border-gray-100">
          <div className="border-b p-4 font-semibold text-[#351018]">
            Conversations
          </div>

          {loadingChats ? (
            <p className="p-4 text-sm text-gray-500">
              Loading conversations...
            </p>
          ) : chatsError ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load conversations.
              <button
                onClick={() => refetchChats()}
                className="mt-2 block underline"
              >
                Try again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conversation) => {
              const partner =
                user?.role === 'organizer'
                  ? conversation.provider
                  : conversation.organizer;

              return (
                <button
                  key={conversation.id}
                  onClick={() => selectChat(conversation.id)}
                  className={`w-full border-b border-gray-100 p-4 text-left transition ${
                    conversationId === conversation.id
                      ? 'bg-[#351018]/10'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-[#351018]">
                    {partner?.businessName ||
                      partner?.name ||
                      'User'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(
                      conversation.updatedAt
                    ).toLocaleDateString()}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        <section className="flex min-h-0 flex-col">
          {!conversationId || !selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
              <MessageCircle size={42} />
              <p className="text-sm">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 p-4 font-semibold text-[#351018]">
                {user?.role === 'organizer'
                  ? selected.provider?.businessName ||
                    selected.provider?.name
                  : selected.organizer?.name}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-5">
                {loadingMessages ? (
                  <p className="text-sm text-gray-500">
                    Loading messages...
                  </p>
                ) : messagesError ? (
                  <div className="text-sm text-red-600">
                    Failed to load messages.
                    <button
                      onClick={() => refetchMessages()}
                      className="ml-2 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          mine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            mine
                              ? 'bg-[#351018] text-white'
                              : 'border bg-white text-gray-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.body}
                          </p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              mine
                                ? 'text-white/60'
                                : 'text-gray-400'
                            }`}
                          >
                            {new Date(
                              message.createdAt
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-3 border-t border-gray-100 p-4"
              >
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={3000}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#351018]"
                />
                <button
                  type="submit"
                  disabled={!body.trim() || isSending}
                  className="flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm text-white disabled:opacity-50"
                >
                  <Send size={17} />
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
