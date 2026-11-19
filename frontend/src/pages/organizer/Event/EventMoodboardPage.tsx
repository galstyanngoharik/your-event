import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetEventByIdQuery } from '../../../features/events/eventsApi';
import { useGetMoodboardQuery } from '../../../features/events/moodboardApi';
import MoodboardEditor from '../../../components/moodboard/MoodboardEditor';

export default function EventMoodboardPage() {
  const { eventId: eventIdParam } = useParams();
  const eventId = Number(eventIdParam);
  const valid = Number.isInteger(eventId) && eventId > 0;
  const { data: event, isLoading: loadingEvent, isError: eventError } = useGetEventByIdQuery(eventId, { skip: !valid });
  const { currentData: moodboard, isLoading, isFetching, isError, refetch } = useGetMoodboardQuery(eventId, { skip: !valid });
  if (!valid) return <p className="text-sm text-red-600">Invalid event.</p>;
  if (loadingEvent) return <p className="text-sm text-[#351018]/60">Loading event...</p>;
  if (eventError || !event) return <p className="text-sm text-red-600">Event not found.</p>;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link to={`/organizer/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-[#351018]/70 hover:text-[#351018]">
        <ArrowLeft size={17} /> Back to {event.title}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-[#351018]">Event Moodboard</h1>
        <p className="mt-1 text-sm text-[#351018]/60">Collect inspiration and bring your event vision to life.</p>
      </div>
      {(isLoading || (isFetching && !moodboard)) && <p className="text-sm text-[#351018]/60">Loading inspiration...</p>}
      {isError && <p role="alert" className="text-sm text-red-600">Could not load the moodboard. <button onClick={() => refetch()} className="underline">Try again</button></p>}
      {moodboard && <MoodboardEditor key={eventId} eventId={eventId} data={moodboard} />}
    </div>
  );
}
