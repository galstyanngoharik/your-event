import { useCallback, useLayoutEffect, useRef } from 'react';
import { useGetMessagesQuery } from './messagesApi';
import { groupedMessage } from './conversationPresentation';
import MessageBubble from './MessageBubble';

export default function MessageHistory({ conversationId, userId }: { conversationId: number; userId?: number }) {
  const { data: messages = [], isLoading, isError, refetch } = useGetMessagesQuery(conversationId, { pollingInterval: 5000 });
  const container = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const lastMessage = messages.at(-1);
  const scrollToBottom = useCallback(() => {
    const element = container.current;
    if (element && nearBottom.current) element.scrollTop = element.scrollHeight;
  }, []);
  useLayoutEffect(() => {
    if (lastMessage?.senderId === userId) nearBottom.current = true;
    scrollToBottom();
  }, [lastMessage?.id, lastMessage?.senderId, userId, scrollToBottom]);

  return (
    <div ref={container} onScroll={() => {
      const element = container.current;
      if (element) nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    }} className="ye-message-history min-h-0 flex-1 overflow-y-auto p-5">
      {isLoading ? <p className="text-sm text-gray-500">Loading messages...</p> : isError ? (
        <p role="alert" className="text-sm text-red-600">Failed to load messages. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>
      ) : messages.length === 0 ? <p className="text-center text-sm text-gray-400">No messages yet. Say hello!</p> : (
        messages.map((message, index) => <MessageBubble grouped={groupedMessage(messages[index - 1], message)} key={message.id} message={message} mine={message.senderId === userId} onMediaReady={scrollToBottom} />)
      )}
    </div>
  );
}
