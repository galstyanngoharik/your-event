import { useState } from 'react';
import { useDeleteMessageMutation } from './messagesApi';
import type { Message } from './messagesApi';
import { messageError } from './messageError';
import MessageActions from './MessageActions';
import MessageAttachment from './MessageAttachment';
import MessageEditor from './MessageEditor';

export default function MessageBubble({ message, mine, onMediaReady, grouped = false }: {
  message: Message; mine: boolean; onMediaReady: () => void; grouped?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [deleteMessage, { isLoading }] = useDeleteMessageMutation();
  const remove = async () => {
    if (isLoading || !window.confirm('Delete this message?')) return;
    setError('');
    try {
      await deleteMessage({ conversationId: message.conversationId, messageId: message.id }).unwrap();
    } catch (failure) { setError(messageError(failure, 'Could not delete the message. Please try again.')); }
  };

  return (
    <div data-grouped={grouped} className={`ye-message-row flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`ye-message-bubble ${mine ? 'ye-message-mine' : 'ye-message-theirs'} min-w-0 max-w-[90%] rounded-2xl px-4 py-3 text-sm sm:max-w-[80%] ${mine ? 'bg-[#351018] text-white' : 'border border-[#D9A3AA]/30 bg-[#FFF8F1] text-[#351018]'}`}>
        {message.deletedAt ? <p className="italic opacity-65">This message was deleted</p> : (
          <div className="space-y-2">
            {message.attachment && <MessageAttachment attachment={message.attachment} onReady={onMediaReady} />}
            {editing ? <MessageEditor message={message} close={() => setEditing(false)} /> : message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
          </div>
        )}
        <div className={`ye-message-meta mt-1 flex items-center justify-end gap-2 text-[10px] ${mine ? 'text-white/60' : 'text-gray-400'}`}>
          {message.editedAt && !message.deletedAt && <span>Edited</span>}
          <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          {mine && !message.deletedAt && !editing && <MessageActions canEdit={Boolean(message.body) && message.attachment?.type !== 'audio'} busy={isLoading} edit={() => setEditing(true)} remove={remove} />}
        </div>
        {isLoading && <p role="status" className="mt-1 text-xs opacity-70">Deleting...</p>}
        {error && <p role="alert" className="mt-2 text-xs">{error}</p>}
      </div>
    </div>
  );
}
