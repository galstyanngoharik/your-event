import type { Conversation, Message } from './messagesApi';

export function filterConversations(conversations: Conversation[], organizer: boolean, search: string) {
  const term = search.trim().toLocaleLowerCase();
  if (!term) return conversations;
  return conversations.filter(conversation => {
    const partner = organizer ? conversation.provider : conversation.organizer;
    return [partner?.name, partner?.businessName, conversation.messages?.[0]?.body]
      .some(value => value?.toLocaleLowerCase().includes(term));
  });
}

export function conversationTime(value: string, now = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}

export function groupedMessage(previous: Message | undefined, current: Message) {
  if (!previous || previous.senderId !== current.senderId || previous.deletedAt || current.deletedAt) return false;
  const before = new Date(previous.createdAt);
  const after = new Date(current.createdAt);
  const elapsed = after.getTime() - before.getTime();
  return elapsed >= 0 && elapsed <= 5 * 60 * 1000 && before.toDateString() === after.toDateString();
}
