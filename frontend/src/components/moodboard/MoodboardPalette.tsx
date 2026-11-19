import { useState } from 'react';
import { useSaveMoodboardColorsMutation } from '../../features/events/moodboardApi';

const validHex = /^#[0-9A-Fa-f]{6}$/;

export default function MoodboardPalette({ eventId, colors, setColors, setError, setNotice }: {
  eventId: number; colors: string[]; setColors: (colors: string[]) => void;
  setError: (message: string) => void; setNotice: (message: string) => void;
}) {
  const [hexDraft, setHexDraft] = useState('#D9A3AA');
  const [saveColors, { isLoading: isSavingColors }] = useSaveMoodboardColorsMutation();
  const addColor = () => {
    if (!validHex.test(hexDraft)) {
      setError('Enter a valid HEX color, for example #D9A3AA.');
      return;
    }
    if (colors.some((color) => color.toLowerCase() === hexDraft.toLowerCase())) return;
    if (colors.length >= 20) { setError('Choose up to 20 colors.'); return; }
    setColors([...colors, hexDraft.toUpperCase()]);
    setError('');
  };

  const handleSaveColors = async () => {
    try {
      await saveColors({ eventId, colors }).unwrap();
      setNotice('Event colors saved.');
      setError('');
    } catch {
      setError('Could not save the color palette.');
    }
  };

  return (
      <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#351018]">Your Event Colors</h2>
          <p className="mt-1 text-sm text-[#351018]/60">Build a palette for your event inspiration.</p>
        </div>
        <div data-export-ignore className="flex flex-wrap items-end gap-3">
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            Choose a color
            <input type="color" value={validHex.test(hexDraft) ? hexDraft : '#D9A3AA'} onChange={(event) => setHexDraft(event.target.value.toUpperCase())} className="block h-11 w-16 cursor-pointer rounded-lg border border-[#351018]/15 bg-white p-1" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            HEX value
            <input value={hexDraft} onChange={(event) => setHexDraft(event.target.value)} maxLength={7} className="block w-32 rounded-xl border border-[#351018]/15 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <button type="button" onClick={addColor} className="rounded-xl border border-[#351018]/20 px-4 py-2.5 text-sm font-medium text-[#351018] hover:bg-[#F2D9DC]/50">Add Color</button>
          <button type="button" onClick={handleSaveColors} disabled={isSavingColors} className="rounded-xl bg-[#351018] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{isSavingColors ? 'Saving...' : 'Save Palette'}</button>
        </div>
      </section>
  );
}
