import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useState } from 'react';
import type { Message } from './messagesApi';
import { useGetMessageAttachmentQuery } from './messageAttachmentsApi';
import MessageImagePreview from './MessageImagePreview';

export default function MessageAttachment({ attachment, onReady }: {
  attachment: NonNullable<Message['attachment']>;
  onReady: () => void;
}) {
  const { data: source, isLoading, isError, refetch } = useGetMessageAttachmentQuery(attachment.url);
  const [preview, setPreview] = useState(false);

  if (isLoading) return <p role="status" className="text-xs opacity-75">Loading attachment...</p>;
  if (isError || !source) return <p role="alert" className="text-xs">Could not load attachment. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>;

  return (
    <>
      {attachment.type === 'audio' ? <VoiceMessagePlayer source={source} duration={attachment.duration} onReady={onReady} /> : attachment.type === 'image' ? (
        <button type="button" onClick={() => setPreview(true)} aria-label={`Preview ${attachment.name}`} className="ye-message-image block cursor-zoom-in">
          <img src={source} alt={attachment.name} onLoad={onReady} className="max-h-72 max-w-full rounded-xl object-contain" />
        </button>
      ) : (
        <video src={source} controls preload="metadata" onLoadedMetadata={onReady} className="max-h-72 max-w-full rounded-xl" />
      )}
      {preview && <MessageImagePreview source={source} name={attachment.name} close={() => setPreview(false)} />}
    </>
  );
}
