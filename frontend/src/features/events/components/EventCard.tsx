import { formatMoney } from '../currency';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin, Users, Wallet } from 'lucide-react';
import type { Event } from '../eventsApi';
import { serviceImage } from '../../services/servicesApi';

export default function EventCard({ event }: { event: Event }) {
  const cover = serviceImage(event.coverImage || undefined);
  return (
    <Link to={`/organizer/events/${event.id}`} className="ye-event-card group">
      {cover && <img src={cover} alt="" loading="lazy" className="ye-event-cover" />}
      <div className="ye-event-card-body flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#D9A3AA]/30 px-3 py-1 text-xs capitalize text-[#351018]">
            {event.status}
          </span>
          <span className="text-xs capitalize text-[#351018]/50">{event.type}</span>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-[#351018]">{event.title}</h3>
        <div className="mt-4 space-y-2 text-sm text-[#351018]/60">
          <p className="flex items-start gap-2">
            <CalendarDays size={16} className="mt-0.5 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
          <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{event.city}</span></p>
        </div>
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9A3AA]/30 pt-4">
            <p className="flex items-center gap-2 font-medium text-[#351018]">
              <Wallet size={16} />{formatMoney(Number(event.budget), event.currency)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-[#351018]/60" title="Expected guests">
              <Users size={15} />{event.expectedGuests}
            </p>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#A86F79]">
            View event <ArrowUpRight size={14} />
          </p>
        </div>
      </div>
    </Link>
  );
}
