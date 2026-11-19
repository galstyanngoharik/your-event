import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Message } from './messagesApi';
import { useEditMessageMutation } from './messagesApi';
import { messageError } from './messageError';

export default function MessageEditor({ message, close }: { message: Message; close: () => void }) {
  const [body, setBody] = useState(message.body);
  const [error, setError] = useState('');
  const [editMessage, { isLoading }] = useEditMessageMutation();
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading || !body.trim()) return;
    setError('');
    try {
      await editMessage({ conversationId: message.conversationId, messageId: message.id, body: body.trim() }).unwrap();
      close();
    } catch (failure) { setError(messageError(failure, 'Could not edit the message. Please try again.')); }
  };

  return (
    <form onSubmit={save} className="space-y-2">
      <textarea autoFocus aria-label="Edit message" value={body} disabled={isLoading} maxLength={3000}
        onChange={(event) => setBody(event.target.value)} rows={3}
        className="w-full min-w-40 rounded-lg border border-[#D9A3AA] bg-white p-2 text-sm text-[#351018] outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
      <div className="flex gap-3 text-xs">
        <button type="submit" disabled={isLoading || !body.trim()} className="rounded-lg bg-[#D9A3AA] px-3 py-2 text-[#351018] disabled:opacity-50">{isLoading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={close} disabled={isLoading} className="rounded-lg border border-white/40 px-3 py-2 disabled:opacity-50">Cancel</button>
      </div>
      {error && <p role="alert" className="text-xs">{error}</p>}
    </form>
  );
}
