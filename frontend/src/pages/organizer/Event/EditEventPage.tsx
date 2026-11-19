import { currencyCode } from '../../../features/events/currency';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import EventForm from '../../../features/events/components/EventForm';

import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
  type EventPayload,
} from '../../../features/events/eventsApi';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const eventId = Number(id);

  const {
    data: event,
    isLoading,
    isError,
  } = useGetEventByIdQuery(eventId, {
    skip: !Number.isInteger(eventId) || eventId <= 0,
  });

  const [updateEvent, { isLoading: isUpdating }] =
    useUpdateEventMutation();

  const handleUpdate = async (data: EventPayload) => {
    try { 
        await updateEvent({ id: eventId, data }).unwrap()
        navigate(`/organizer/events/${eventId}`);
    } catch(err) {
        console.log(err);
    }
  };

  if (isLoading) {
    return <p className="text-[#351018]">Loading event...</p>;
  }

  if (isError || !event) {
    return <p className="text-red-600">Event not found.</p>;
  }

  const initialValues: EventPayload = {
    title: event.title,
    type: event.type,
    description: event.description ?? '',
    date: event.date.slice(0, 16),
    city: event.city,
    address: event.address ?? '',
    budget: Number(event.budget ?? 0),
    currency: currencyCode(event.currency),
    expectedGuests: event.expectedGuests ?? 0,
    status: event.status,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <button
          onClick={() => navigate(`/organizer/events/${eventId}`)}
          className="mb-5 flex items-center gap-2 text-sm text-[#351018]/60"
        >
          <ArrowLeft size={18} />
          Back to Event
        </button>

        <h1 className="text-3xl font-semibold text-[#351018]">
          Edit Event
        </h1>

        <p className="mt-2 text-sm text-[#351018]/60">
          Update your event information.
        </p>
      </div>

      <EventForm
        key={event.id}
        initialValues={initialValues}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        submitLabel="Save Changes"
      />
    </div>
  );
}