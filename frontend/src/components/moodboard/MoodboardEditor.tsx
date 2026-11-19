import { useState } from 'react';
import type { MoodboardData } from '../../features/events/moodboardApi';
import MoodboardUpload from './MoodboardUpload';
import MoodboardPalette from './MoodboardPalette';
import MoodboardCanvas from './MoodboardCanvas';

export default function MoodboardEditor({ eventId, data }: { eventId: number; data: MoodboardData }) {
  const [colors, setColors] = useState(data.colors);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  return (
    <>
      <MoodboardUpload eventId={eventId} setError={setError} setNotice={setNotice} />
      <MoodboardPalette eventId={eventId} colors={colors} setColors={setColors} setError={setError} setNotice={setNotice} />
      {notice && <p role="status" className="text-sm text-[#351018]">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-white p-3 text-sm text-red-600">{error}</p>}
      <MoodboardCanvas eventId={eventId} data={data} colors={colors} removeColor={(color) => setColors((current) => current.filter((entry) => entry !== color))} setError={setError} />
    </>
  );
}
