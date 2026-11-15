import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import EventForm from '../../../features/events/components/EventForm';
import { useCreateEventMutation } from '../../../features/events/eventsApi';
import type { EventPayload } from '../../../features/events/eventsApi';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const handleCreate = async (data: EventPayload) => {
    try {
        const event = await createEvent(data).unwrap();
        navigate(`/organizer/events/${event.id}`);
    } catch(err) { console.log(err)}
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <button
          onClick={() => navigate('/organizer/events')}
          className="mb-5 flex items-center gap-2 text-sm text-[#351018]/60 hover:text-[#351018]"
        >
          <ArrowLeft size={18} />
          Back to Events
        </button>

        <h1 className="text-3xl font-semibold text-[#351018]">
          Create New Event
        </h1>

        <p className="mt-2 text-sm text-[#351018]/60">
          Every unforgettable moment starts with a plan.
        </p>
      </div>

      <EventForm
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="Create Event"
      />
    </div>
  );
}