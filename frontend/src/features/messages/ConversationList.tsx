import { useState } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';
import type { Conversation } from './messagesApi';
import ConversationIdentity from './ConversationIdentity';
import { conversationTime, filterConversations } from './conversationPresentation';

export default function ConversationList({ conversations, organizer, selectedId, loading, error, retry, select }: {
  conversations: Conversation[];
  organizer: boolean;
  selectedId: number | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  select: (id: number) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = filterConversations(conversations, organizer, search);
  return (
    <aside className="ye-conversations" aria-label="Conversations">
      <div className="ye-conversations-heading">
        <div className="flex items-center gap-2.5">
          <MessageSquare size={19} aria-hidden="true" />
          <h2>Conversations</h2>
        </div>
        <p>Keep every detail connected.</p>
        <div className="ye-conversation-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" value={search} onChange={event => setSearch(event.target.value)}
            aria-label="Search conversations" placeholder="Search conversations…" />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear conversation search"><X size={15} /></button>}
        </div>
      </div>
      <div className="ye-conversation-results" aria-live="polite">
        {loading ? (
          <div role="status" aria-label="Loading conversations" className="space-y-3 p-4">
            {[0, 1, 2].map(index => <div key={index} className="ye-conversation-skeleton" />)}
          </div>
        ) : error ? (
          <div className="p-5 text-sm text-[#351018]" role="alert">
            Failed to load conversations.
            <button type="button" onClick={retry} className="mt-2 block underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ye-conversations-empty">
            <MessageSquare size={28} aria-hidden="true" />
            <p>{search.trim() ? 'No conversations found.' : 'No conversations yet.'}</p>
            {search.trim() && <button type="button" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : filtered.map(conversation => {
          const recent = conversation.messages?.[0];
          const timestamp = recent?.createdAt || conversation.updatedAt;
          return (
            <button key={conversation.id} type="button" onClick={() => select(conversation.id)}
              aria-current={selectedId === conversation.id ? 'true' : undefined}
              className="ye-conversation-card">
              <div className="ye-conversation-card-top">
                <ConversationIdentity partner={organizer ? conversation.provider : conversation.organizer} />
                <time dateTime={timestamp} title={new Date(timestamp).toLocaleString()}>{conversationTime(timestamp)}</time>
              </div>
              {recent?.body && <p className="ye-conversation-preview">{recent.body}</p>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
