import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { useCreateTimelineActivityMutation, useUpdateTimelineActivityMutation } from '../timelineApi';
import type { TimelineActivity } from '../timelineApi';
import { activityDuration } from '../timelineTime';

export default function TimelineForm({ eventId, activity, close }: {
  eventId: number; activity?: TimelineActivity; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const [title, setTitle] = useState(activity?.title || '');
  const [startTime, setStartTime] = useState(activity?.startTime || '');
  const [endTime, setEndTime] = useState(activity?.endTime || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [location, setLocation] = useState(activity?.location || '');
  const [error, setError] = useState('');
  const [createActivity, { isLoading: creating }] = useCreateTimelineActivityMutation();
  const [updateActivity, { isLoading: updating }] = useUpdateTimelineActivityMutation();
  const busy = creating || updating;
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    if (!title.trim() || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      setError('Enter a title and a valid start time.');
      return;
    }
    if (endTime && (activityDuration(startTime, endTime) ?? 0) <= 0) {
      setError('End time must be later than start time on the same day.');
      return;
    }
    pending.current = true;
    const data = { title: title.trim(), startTime, endTime: endTime || null, description: description.trim() || null, location: location.trim() || null };
    try {
      if (activity) await updateActivity({ eventId, activityId: activity.id, data }).unwrap();
      else await createActivity({ eventId, data }).unwrap();
      close();
    } catch { setError('Could not save the activity. Please try again.'); }
    finally { pending.current = false; }
  };
  const input = 'mt-2 w-full rounded-xl border border-[#351018]/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]';
  return (
    <dialog ref={dialog} aria-label={activity ? 'Edit activity' : 'Add activity'} onCancel={(event) => { if (pending.current) event.preventDefault(); else close(); }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 text-[#351018] backdrop:bg-black/50">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{activity ? 'Edit Activity' : 'Add Activity'}</h2>
        <button type="button" onClick={close} disabled={busy} aria-label="Close activity form" className="rounded-full p-2 hover:bg-[#F2D9DC]/40 disabled:opacity-50"><X size={20} /></button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          <label className="block text-sm font-medium">Title<input autoFocus required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className={input} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Start Time<input required type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={input} /></label>
            <label className="block text-sm font-medium">End Time (optional)<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={input} /></label>
          </div>
          <label className="block text-sm font-medium">Description (optional)<textarea rows={3} maxLength={1500} value={description} onChange={(event) => setDescription(event.target.value)} className={input} /></label>
          <label className="block text-sm font-medium">Location (optional)<input maxLength={250} value={location} onChange={(event) => setLocation(event.target.value)} className={input} /></label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={close} disabled={busy} className="rounded-xl border border-[#D9A3AA]/40 px-4 py-3 text-sm disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-xl bg-[#351018] px-5 py-3 text-sm text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save Activity'}</button>
        </div>
      </form>
    </dialog>
  );
}
