import { MapPin, Pencil, Trash2 } from 'lucide-react';
import type { TimelineActivity } from '../timelineApi';
import { activityDuration } from '../timelineTime';

export default function TimelineItem({ activity, busy, edit, remove }: {
  activity: TimelineActivity; busy: boolean; edit: () => void; remove: () => void;
}) {
  const duration = activityDuration(activity.startTime, activity.endTime);
  return (
    <li className="relative border-l border-[#D9A3AA]/50 pb-5 pl-6 last:pb-0 sm:pl-8">
      <span className="absolute -left-1.5 top-6 h-3 w-3 rounded-full border-2 border-[#D9A3AA] bg-[#351018]" />
      <article className="space-y-3 rounded-2xl border border-[#D9A3AA]/35 bg-white p-5 transition-shadow hover:shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium tabular-nums text-[#351018]"><time dateTime={activity.startTime}>{activity.startTime}</time>{activity.endTime && <> — <time dateTime={activity.endTime}>{activity.endTime}</time></>}</p>
            <h3 className="mt-1 break-words text-lg font-semibold text-[#351018]">{activity.title}</h3>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={edit} disabled={busy} aria-label={`Edit ${activity.title}`} className="rounded-lg p-2 text-[#351018] hover:bg-[#F2D9DC]/40 disabled:opacity-50"><Pencil size={16} /></button>
            <button type="button" onClick={remove} disabled={busy} aria-label={`Delete ${activity.title}`} className="rounded-lg p-2 text-[#351018] hover:bg-[#F2D9DC]/40 disabled:opacity-50"><Trash2 size={16} /></button>
          </div>
        </div>
        {activity.description && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#351018]/70">{activity.description}</p>}
        {activity.location && <p className="flex items-start gap-2 break-words text-sm text-[#351018]/70"><MapPin size={16} className="mt-0.5 shrink-0" /><span className="min-w-0 break-words">{activity.location}</span></p>}
        {duration !== null && <p className="text-xs text-[#351018]/50">Duration: {duration >= 60 ? `${Math.floor(duration / 60)}h ` : ''}{duration % 60 ? `${duration % 60} min` : ''}</p>}
      </article>
    </li>
  );
}
