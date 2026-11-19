import { voiceTime } from './voiceTime';
import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function VoiceMessagePlayer({ source, duration: savedDuration, onReady }: {
  source: string; duration?: number | null; onReady?: () => void;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const probing = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(savedDuration || 0);
  const [error, setError] = useState('');
  const toggle = async () => {
    const element = audio.current;
    if (!element) return;
    setError('');
    if (!element.paused) element.pause();
    else {
      if (element.ended) element.currentTime = 0;
      try { await element.play(); }
      catch { setError('Could not play this recording in your browser.'); }
    }
  };
  const updateDuration = () => {
    const element = audio.current;
    if (element && Number.isFinite(element.duration) && element.duration > 0) setDuration(element.duration);
  };

  return (
    <div className="ye-voice-player w-60 max-w-full space-y-2">
      <audio ref={audio} src={source} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onDurationChange={updateDuration} onEnded={() => setPlaying(false)}
        onLoadedMetadata={() => {
          updateDuration();
          if (audio.current?.duration === Infinity) {
            probing.current = true;
            try { audio.current.currentTime = 1e10; }
            catch { probing.current = false; }
          }
          onReady?.();
        }}
        onTimeUpdate={() => {
          if (!audio.current) return;
          if (probing.current) {
            probing.current = false;
            updateDuration();
            audio.current.currentTime = 0;
          }
          if (Number.isFinite(audio.current.currentTime)) setPosition(audio.current.currentTime);
        }} onError={() => setError('This recording cannot be played in your browser.')} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause voice message' : 'Play voice message'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9A3AA] text-[#351018] outline-none focus-visible:ring-2 focus-visible:ring-[#D9A3AA] focus-visible:ring-offset-2">
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="min-w-0 flex-1">
          <input type="range" aria-label="Voice message playback position" min={0} max={duration || 1} step={0.1}
            value={Math.min(position, duration || 1)} disabled={!duration}
            onChange={(event) => {
              if (audio.current) {
                try { audio.current.currentTime = Number(event.target.value); }
                catch { setError('Seeking is not available yet. Try playing the recording first.'); return; }
              }
              setPosition(Number(event.target.value));
            }} className="block w-full cursor-pointer accent-[#D9A3AA]" />
          <p className="mt-1 text-xs tabular-nums opacity-75">{voiceTime(position)} / {voiceTime(duration)}</p>
        </div>
      </div>
      {error && <p role="alert" className="text-xs">{error}</p>}
    </div>
  );
}
