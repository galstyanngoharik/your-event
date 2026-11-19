import { Send, Square, Trash2, X } from 'lucide-react';
import type { useVoiceRecorder } from './useVoiceRecorder';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { voiceTime } from './voiceTime';

export default function VoiceRecorder({ recorder, busy, send }: {
  recorder: ReturnType<typeof useVoiceRecorder>; busy: boolean; send: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl bg-[#F2D9DC]/30 p-3 text-[#351018]">
      {recorder.status === 'preview' && recorder.recording ? (
        <>
          <VoiceMessagePlayer source={recorder.recording.url} duration={recorder.recording.duration} />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" disabled={busy} onClick={recorder.reset} className="inline-flex items-center gap-1 rounded-lg border border-[#D9A3AA] px-3 py-2 disabled:opacity-50"><Trash2 size={16} />Discard</button>
            <button type="button" disabled={busy} onClick={send} className="inline-flex items-center gap-2 rounded-lg bg-[#351018] px-4 py-2 text-white disabled:opacity-50"><Send size={16} />{busy ? 'Uploading...' : 'Send voice message'}</button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {recorder.status === 'recording' && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" />}
          <span role="status" className="flex-1 tabular-nums">{recorder.status === 'requesting' ? 'Waiting for microphone permission...' : recorder.status === 'stopping' ? 'Preparing recording...' : `Recording ${voiceTime(recorder.seconds)} / 2:00`}</span>
          {recorder.status === 'recording' && <button type="button" onClick={recorder.stop} className="inline-flex items-center gap-1 rounded-lg bg-[#351018] px-3 py-2 text-white"><Square size={15} />Stop</button>}
          <button type="button" onClick={recorder.reset} aria-label="Cancel recording" className="rounded-lg p-2 hover:bg-[#F2D9DC]"><X size={18} /></button>
        </div>
      )}
    </div>
  );
}
