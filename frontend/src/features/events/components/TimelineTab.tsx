import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGetTimelineQuery, useDeleteTimelineActivityMutation } from '../timelineApi';
import type { TimelineActivity } from '../timelineApi';
import TimelineItem from './TimelineItem';
import TimelineForm from './TimelineForm';

export default function TimelineTab({ eventId, eventDate }: { eventId: number; eventDate: string }) {
  const { currentData: activities = [], isLoading, isError, refetch } = useGetTimelineQuery(eventId);
  const [deleteActivity, { isLoading: deleting }] = useDeleteTimelineActivityMutation();
  const [form, setForm] = useState<TimelineActivity | 'new' | null>(null);
  const [error, setError] = useState('');
  const remove = async (activity: TimelineActivity) => {
    if (deleting || !window.confirm(`Delete "${activity.title}" from the timeline?`)) return;
    setError('');
    try { await deleteActivity({ eventId, activityId: activity.id }).unwrap(); }
    catch { setError('Could not delete the activity. Please try again.'); }
  };
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#351018]">Event Timeline</h2>
          <p className="mt-1 text-sm text-[#351018]/60">{new Date(eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })} · Single-day schedule</p>
        </div>
        <button type="button" onClick={() => setForm('new')} className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-4 py-3 text-sm text-white"><Plus size={17} />Add Activity</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {isLoading ? <p className="text-sm text-[#351018]/60">Loading timeline...</p> : isError ? (
        <p role="alert" className="text-sm text-red-600">Could not load the timeline. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-[#D9A3AA]/30 bg-[#FFF8F1] px-5 py-10 text-center">
          <h3 className="font-semibold text-[#351018]">Your timeline is waiting to begin.</h3>
          <p className="mt-2 text-sm text-[#351018]/60">Add activities to create the perfect schedule for your event.</p>
          <button type="button" onClick={() => setForm('new')} className="mt-5 rounded-xl bg-[#351018] px-4 py-3 text-sm text-white">Add First Activity</button>
        </div>
      ) : <ol>{activities.map((activity) => <TimelineItem key={activity.id} activity={activity} busy={deleting} edit={() => setForm(activity)} remove={() => { void remove(activity); }} />)}</ol>}
      {form && <TimelineForm key={form === 'new' ? 'new' : form.id} eventId={eventId} activity={form === 'new' ? undefined : form} close={() => setForm(null)} />}
    </section>
  );
}
