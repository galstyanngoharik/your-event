import { useEffect, useRef, useState } from 'react';

const formats = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm', 'audio/ogg'];
type Status = 'idle' | 'requesting' | 'recording' | 'stopping' | 'preview';

export function useVoiceRecorder() {
  const [status, setStatus] = useState<Status>('idle');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState<{ file: File; url: string; duration: number } | null>(null);
  const session = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrl = useRef<string | null>(null);
  const requesting = useRef(false);
  const startedAt = useRef(0);
  const elapsedAtStop = useRef(0);

  const release = () => {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };
  const dispose = () => {
    session.current++;
    requesting.current = false;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    recorder.current = null;
    release();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  };
  const reset = () => {
    dispose();
    setStatus('idle');
    setRecording(null);
    setSeconds(0);
    setError('');
  };
  useEffect(() => () => {
    session.current++;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    if (interval.current) clearInterval(interval.current);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const start = async () => {
    if (requesting.current || recorder.current) return;
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording requires a supported browser on HTTPS or localhost.');
      return;
    }
    const generation = ++session.current;
    requesting.current = true;
    setStatus('requesting');
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== session.current) {
        microphone.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = microphone;
      requesting.current = false;
      const mimeType = formats.find((format) => MediaRecorder.isTypeSupported(format));
      const active = new MediaRecorder(microphone, mimeType ? { mimeType, audioBitsPerSecond: 64000 } : undefined);
      recorder.current = active;
      const chunks: Blob[] = [];
      let size = 0;
      const started = performance.now();
      startedAt.current = started;
      active.ondataavailable = (event) => {
        if (generation !== session.current || !event.data.size) return;
        chunks.push(event.data);
        size += event.data.size;
        if (size > 10 * 1024 * 1024) {
          reset();
          setError('Voice recordings must be 10 MB or smaller.');
        }
      };
      active.onerror = () => {
        if (generation !== session.current) return;
        reset();
        setError('Recording failed. Check your microphone and try again.');
      };
      const stopRecording = () => {
        if (active.state !== 'recording') return;
        elapsedAtStop.current = (performance.now() - started) / 1000;
        setStatus('stopping');
        active.stop();
        release();
      };
      active.onstop = () => {
        if (generation !== session.current) return;
        release();
        recorder.current = null;
        const actualType = active.mimeType || chunks[0]?.type || '';
        const extension = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a' }[actualType.split(';')[0]];
        const duration = elapsedAtStop.current;
        if (!size || duration < 0.25 || !extension) {
          reset();
          setError('The recording is empty or uses an unsupported format. Please try again.');
          return;
        }
        const file = new File(chunks, `voice-message-${Date.now()}.${extension}`, { type: actualType });
        const url = URL.createObjectURL(file);
        objectUrl.current = url;
        setRecording({ file, url, duration });
        setStatus('preview');
      };
      active.start(250);
      setSeconds(0);
      setStatus('recording');
      interval.current = setInterval(() => {
        const elapsed = (performance.now() - started) / 1000;
        setSeconds(Math.floor(elapsed));
        if (elapsed >= 119) stopRecording();
      }, 250);
      microphone.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (generation === session.current) stopRecording();
        };
      });
    } catch (failure) {
      if (generation !== session.current) return;
      dispose();
      setStatus('idle');
      const name = failure instanceof DOMException ? failure.name : '';
      setError(name === 'NotAllowedError' ? 'Microphone access was denied. Allow it in your browser settings and try again.'
        : name === 'NotFoundError' ? 'No microphone was found.' : name === 'NotSupportedError' ? 'Your browser cannot record a supported audio format. Try another browser.' : 'Could not access the microphone. Close other apps using it and try again.');
    }
  };
  const stop = () => {
    const active = recorder.current;
    if (active?.state !== 'recording') return;
    elapsedAtStop.current = (performance.now() - startedAt.current) / 1000;
    active.stop();
    release();
    setStatus('stopping');
  };
  return { status, seconds, error, recording, start, stop, reset };
}
