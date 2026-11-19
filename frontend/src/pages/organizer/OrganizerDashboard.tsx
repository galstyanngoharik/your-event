import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  ArrowRight,
} from 'lucide-react';

import { useGetDashboardEventsQuery } from '../../features/events/eventsApi';
import DashboardAnalytics, { AnalyticsSkeleton } from '../../features/dashboard/DashboardAnalytics';
import EventCountdown from '../../features/events/components/EventCountdown';
import EventProgress from '../../features/events/components/EventProgress';

export default function OrganizerDashboard() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const { data: events = [], isLoading, isError, isFetching, refetch } = useGetDashboardEventsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });

  const upcomingEvents = events.filter(
    (event) =>
      new Date(event.date).getTime() >= now &&
      event.status !== 'cancelled'
  );

  const nearestEvent = [...upcomingEvents]
    .filter((event) => Number.isFinite(new Date(event.date).getTime()))
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())[0];

  if (isLoading) {
    return (
      <AnalyticsSkeleton />
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load dashboard data.
        <button type="button" onClick={() => refetch()} className="ml-2 underline">Try again</button>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 rounded-2xl bg-[#F8F3EF] p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#351018]">
            Your Overview
          </h2>

          <p className="mt-1 text-sm text-[#351018]/60">
            Here's what's happening with your events.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      <DashboardAnalytics events={events} refreshing={isFetching} now={now} />

      {nearestEvent ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#351018]">Next Event</h3>
            <Link to={`/organizer/events/${nearestEvent.id}`} className="text-sm font-medium text-[#351018] transition hover:text-[#A86F79]">
              View Event
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <EventCountdown date={nearestEvent.date} title={nearestEvent.title} />
            <EventProgress eventId={nearestEvent.id} eventTitle={nearestEvent.title} tasks={nearestEvent.tasks} />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-6">
          <h3 className="font-semibold text-[#351018]">Countdown &amp; Planning Progress</h3>
          <p className="mt-2 text-sm text-[#351018]/60">Create an upcoming event to see its countdown and planning progress.</p>
        </section>
      )}

      <section className="rounded-2xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#351018]">
            Upcoming Events
          </h3>

          <Link
            to="/organizer/events"
              className="flex items-center gap-2 text-sm font-medium text-[#351018] transition hover:text-[#A86F79]"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays
              size={40}
              className="mx-auto mb-4 text-[#D9A3AA]"
            />

            <p className="text-[#351018]/60">
              You don't have any upcoming events yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                to={`/organizer/events/${event.id}`}
                className="flex items-center justify-between rounded-xl border border-[#D9A3AA]/40 bg-[#F8F3EF] p-4 transition hover:bg-[#D9A3AA]/30"
              >
                <div>
                  <h4 className="font-medium text-[#351018]">
                    {event.title}
                  </h4>

                  <p className="mt-1 text-sm text-[#351018]/50">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>

                <ArrowRight size={18} className="text-[#351018]" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}