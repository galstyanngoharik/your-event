import EventCard from '../../../features/events/components/EventCard';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';

import { useGetEventsQuery } from '../../../features/events/eventsApi';

export default function MyEventsPage() {
  const { data: events = [], isLoading, isError } = useGetEventsQuery();

  if (isLoading) {
    return <p className="text-[#351018]">Loading events...</p>;
  }

  if (isError) {
    return <p className="text-red-600">Failed to load events.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#351018]">
            My Events
          </h2>

          <p className="mt-1 text-sm text-[#351018]/60">
            Manage all your events in one place.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]"
        >
          <Plus size={18} />
          New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-[#D9A3AA]/50 bg-white px-6 py-16 text-center">
          <CalendarDays
            size={48}
            className="mx-auto mb-5 text-[#D9A3AA]"
          />

          <h3 className="text-xl font-semibold text-[#351018]">
            No events yet
          </h3>

          <p className="mt-2 text-sm text-[#351018]/60">
            Create your first event and start planning.
          </p>

          <Link
            to="/organizer/events/new"
            className="mt-6 inline-flex rounded-xl bg-[#351018] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}