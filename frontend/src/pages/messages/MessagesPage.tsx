import './messages.css';
import MessageComposer from '../../features/messages/MessageComposer';
import MessageHistory from '../../features/messages/MessageHistory';
import ConversationIdentity from '../../features/messages/ConversationIdentity';
import ConversationList from '../../features/messages/ConversationList';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { useGetConversationsQuery } from '../../features/messages/messagesApi';

export default function MessagesPage() {
  const user = useAppSelector(state => state.auth.user);
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get('chat'));
  const conversationId = Number.isInteger(selectedId) && selectedId > 0 ? selectedId : null;
  const {
    data: conversations = [], isLoading: loadingChats, isError: chatsError, refetch: refetchChats,
  } = useGetConversationsQuery(undefined, { pollingInterval: 10000 });
  const selected = conversations.find(conversation => conversation.id === conversationId);
  const partner = user?.role === 'organizer' ? selected?.provider : selected?.organizer;
  const selectChat = (id: number) => setParams({ chat: String(id) });
  const backToConversations = () => setParams(previous => {
    const next = new URLSearchParams(previous);
    next.delete('chat');
    return next;
  });
  const home = user?.role === 'provider' ? '/provider' : '/organizer';

  return (
    <div className="ye-premium-messages mx-auto max-w-7xl">
      <div className="ye-messages-page-heading">
        <div>
          <p className="ye-messages-eyebrow">Your conversations</p>
          <h1 className="font-serif text-2xl text-[#351018] sm:text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-[#351018]/60">Thoughtful plans start with a conversation.</p>
        </div>
        <Link to={home} className="ye-messages-dashboard-link">
          <ArrowLeft size={15} /> <span>Dashboard</span>
        </Link>
      </div>
      <div className="ye-messages" data-chat-open={Boolean(selected)}>
        <ConversationList conversations={conversations} organizer={user?.role === 'organizer'}
          selectedId={conversationId} loading={loadingChats} error={chatsError}
          retry={refetchChats} select={selectChat} />
        <section className="ye-chat-body" aria-label="Active conversation">
          {!conversationId || !selected ? (
            <div className="ye-chat-empty">
              <span><MessageCircle size={30} strokeWidth={1.5} /></span>
              <h2>Your next conversation starts here</h2>
              <p>Select a conversation to keep your event plans moving.</p>
            </div>
          ) : (
            <>
              <div className="ye-chat-heading">
                <button type="button" onClick={backToConversations} className="ye-chat-back" aria-label="Back to conversations">
                  <ArrowLeft size={20} />
                </button>
                <ConversationIdentity partner={partner}
                  subtitle={partner?.businessName && partner.name !== partner.businessName ? partner.name : undefined} />
              </div>
              <MessageHistory key={`history-${selected.id}`} conversationId={selected.id} userId={user?.id} />
              <MessageComposer key={`composer-${selected.id}`} conversationId={selected.id} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
