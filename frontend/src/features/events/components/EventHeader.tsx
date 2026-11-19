import { formatMoney } from '../currency';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Pencil, Trash2, Users, Wallet } from 'lucide-react';
import type { Event } from '../eventsApi';
import { serviceImage } from '../../services/servicesApi';

export default function EventHeader({ event, deleting, remove }: {
  event: Event;
  deleting: boolean;
  remove: () => void;
}) {
  const cover = serviceImage(event.coverImage || undefined);
  const details = [
    { label: 'Date', value: new Date(event.date).toLocaleDateString(), icon: CalendarDays },
    { label: 'Location', value: [event.city, event.address].filter(Boolean).join(', '), icon: MapPin },
    { label: 'Budget', value: `${formatMoney(Number(event.budget), event.currency)}`, icon: Wallet },
    { label: 'Expected Guests', value: event.expectedGuests, icon: Users },
  ];
  return (
    <section className="ye-event-header rounded-2xl border border-[#351018]/10 p-6 md:p-8">
      {cover && <img src={cover} alt="" />}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1 basis-64">
          <span className="rounded-full bg-[#D9A3AA]/30 px-3 py-1 text-xs capitalize text-[#351018]">{event.status}</span>
          <h1 className="mt-4 font-serif text-3xl font-medium text-[#351018] sm:text-4xl">{event.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#351018]/60">{event.description || 'No description provided.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/organizer/events/${event.id}/edit`}
            className="flex items-center gap-2 rounded-xl border border-[#351018]/20 px-4 py-2.5 text-sm text-[#351018]">
            <Pencil size={16} />Edit
          </Link>
          <button onClick={remove} disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-[#351018] px-4 py-2.5 text-sm text-white disabled:opacity-50">
            <Trash2 size={16} />Delete
          </button>
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[#351018]/10 bg-[#351018]/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#351018]/60"><Icon size={16} />{label}</div>
            <p className="text-sm font-semibold text-[#351018]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
