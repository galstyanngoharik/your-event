import VoiceRecorder from './VoiceRecorder';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Mic, Paperclip, Send, X } from 'lucide-react';
import { useSendMessageMutation } from './messagesApi';
import { messageError } from './messageError';

const images = ['image/jpeg', 'image/png', 'image/webp'];
const videos = ['video/mp4', 'video/webm'];

export default function MessageComposer({ conversationId }: { conversationId: number }) {
  const voice = useVoiceRecorder();
  const voiceActive = voice.status !== 'idle';
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState('');
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => {
    if (attachment) URL.revokeObjectURL(attachment.preview);
  }, [attachment]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const isImage = images.includes(file.type);
    if (!isImage && !videos.includes(file.type)) {
      setError('Choose a JPEG, PNG, WEBP, MP4 or WEBM file.');
      return;
    }
    if (file.size > (isImage ? 10 : 50) * 1024 * 1024) {
      setError(isImage ? 'Images must be 10 MB or smaller.' : 'Videos must be 50 MB or smaller.');
      return;
    }
    setError('');
    setAttachment({ file, preview: URL.createObjectURL(file) });
  };

  const send = async (voiceFile?: File) => {
    if (busy.current || (!body.trim() && !attachment && !voiceFile)) return;
    busy.current = true;
    setError('');
    try {
      await sendMessage({ conversationId, body: body.trim(), attachment: voiceFile || attachment?.file }).unwrap();
      setBody('');
      setAttachment(null);
      if (voiceFile) voice.reset();
    } catch (failure) {
      setError(messageError(failure, 'Could not send your message. Please try again.'));
    } finally { busy.current = false; }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!voiceActive) void send();
  };

  return (
    <form onSubmit={submit} className="ye-composer space-y-3 border-t border-[#D9A3AA]/30 p-4">
      {voiceActive && <VoiceRecorder recorder={voice} busy={isLoading} send={() => { if (voice.recording) void send(voice.recording.file); }} />}
      {attachment && (
        <div className="ye-composer-preview flex items-start gap-3 rounded-xl bg-[#F2D9DC]/30 p-3">
          {images.includes(attachment.file.type)
            ? <img src={attachment.preview} alt="Attachment preview" className="max-h-32 max-w-[60%] rounded-lg object-contain" />
            : <video src={attachment.preview} controls preload="metadata" className="max-h-32 max-w-[60%] rounded-lg" />}
          <span className="min-w-0 flex-1 break-words text-xs text-[#351018]">{attachment.file.name}</span>
          <button type="button" disabled={isLoading} onClick={() => setAttachment(null)} aria-label="Remove attachment" className="text-[#351018] disabled:opacity-50"><X size={18} /></button>
        </div>
      )}
      {!voiceActive && <div className="ye-composer-controls flex items-center gap-2 sm:gap-3">
        <input ref={input} type="file" accept={[...images, ...videos].join(',')} disabled={isLoading} onChange={selectFile} className="sr-only" />
        <button type="button" onClick={() => input.current?.click()} disabled={isLoading} aria-label="Attach photo or video" title="Images up to 10 MB; videos up to 50 MB" className="ye-composer-icon rounded-xl p-2 text-[#351018] hover:bg-[#F2D9DC]/50 disabled:opacity-50"><Paperclip size={20} /></button>
        <button type="button" onClick={() => void voice.start()} disabled={isLoading || Boolean(attachment)} aria-label="Record voice message" title="Record a voice message (up to 2 minutes)" className="ye-composer-icon rounded-xl p-2 text-[#351018] hover:bg-[#F2D9DC]/50 disabled:opacity-50"><Mic size={20} /></button>
        <input value={body} onChange={(event) => setBody(event.target.value)} disabled={isLoading} maxLength={3000}
          aria-label="Message" placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-xl border border-[#D9A3AA]/40 px-3 py-3 text-sm outline-none focus:border-[#D9A3AA] focus:ring-2 focus:ring-[#D9A3AA]/20" />
        <button type="submit" disabled={isLoading || (!body.trim() && !attachment)} aria-label="Send message"
          className="ye-send-button flex items-center gap-2 rounded-xl bg-[#351018] px-3 py-3 text-sm text-white transition-colors hover:bg-[#D9A3AA] hover:text-[#351018] disabled:opacity-50 sm:px-5">
          <Send size={17} /><span className="hidden sm:inline">Send</span>
        </button>
      </div>}
      {voice.error && <p role="alert" className="text-sm text-red-600">{voice.error}</p>}
      {isLoading && <p role="status" className="text-xs text-[#351018]/70">{attachment ? 'Uploading attachment and sending...' : 'Sending...'}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
