import { currencyCode } from '../../../features/events/currency';
import TimelineTab from '../../../features/events/components/TimelineTab';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import EventHeader from '../../../features/events/components/EventHeader';

import {
  useGetEventByIdQuery,
  useDeleteEventMutation,
} from '../../../features/events/eventsApi';
import TasksTab from '../../../features/events/components/TasksTab';
import ExpensesTab from '../../../features/events/components/ExpensesTab';
import GuestsTab from '../../../features/events/components/GuestsTab';
import InvitationBuilder from '../../../features/events/components/InvitationBuilder';
import EventCountdown from '../../../features/events/components/EventCountdown';
import EventProgress from '../../../features/events/components/EventProgress';
const tabs = ['Overview', 'Tasks', 'Budget', 'Guests', 'Invitation', 'Moodboard', 'Timeline'];

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const eventId = Number(id);

  const { data: event, isLoading, isError } =
    useGetEventByIdQuery(eventId, {
      skip: !Number.isInteger(eventId) || eventId <= 0,
    });

  const [deleteEvent, { isLoading: isDeleting }] =
    useDeleteEventMutation();

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if(!confirmed) return; 
    deleteEvent(eventId).unwrap()
    try {
        await deleteEvent(eventId).unwrap();
        navigate('/organizer/events');
    } catch (err) {
        console.log(err);
    }
  };

  if (isLoading) {
    return <p className="text-[#351018]">Loading event...</p>;
  }

  if (isError || !event) {
    return <p className="text-red-600">Event not found.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-sm text-[#351018]/60 hover:text-[#351018]"
      >
        <ArrowLeft size={18} />
        Back to Events
      </Link>

      <EventHeader event={event} deleting={isDeleting} remove={handleDelete} />

      <section className="rounded-2xl border border-[#351018]/10 bg-white p-6">
        <div className="ye-tabs flex overflow-x-auto">
         {tabs.map((tab) => (
            tab === 'Moodboard' ? (
              <Link
                key={tab}
                to={`/organizer/events/${eventId}/moodboard`}
                className="shrink-0 border-b-2 border-transparent pb-4 text-sm font-medium text-[#351018]/50 transition hover:text-[#351018]"
              >
                {tab}
              </Link>
            ) : (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
                className={`shrink-0 border-b-2 pb-4 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'border-[#351018] text-[#351018]'
                    : 'border-transparent text-[#351018]/50 hover:text-[#351018]'
                }`}
              >
                {tab}
              </button>
            )
        ))}
        </div>

        <div className="py-8">
            {activeTab === 'Overview' && (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-[#351018]">
             Event Overview
            </h2>

            <p className="mt-3 text-sm text-[#351018]/60">
            {event.description || 'No description provided.'}
            </p>
            <div className="grid gap-5 lg:grid-cols-2">
              <EventCountdown date={event.date} />
              <EventProgress eventId={eventId} eventTitle={event.title} />
            </div>
        </div>
        )}

        {activeTab === 'Tasks' && (
            <TasksTab eventId={eventId}/>
        )}

        {activeTab === 'Budget' && (
            <ExpensesTab eventId={eventId}
            budget={Number(event.budget)} currency={currencyCode(event.currency)}
            />
        )}

        {activeTab === 'Guests' && (
            <GuestsTab eventId={eventId} />
        )}

        {activeTab === 'Timeline' && <TimelineTab key={eventId} eventId={eventId} eventDate={event.date} />}

        {activeTab === 'Invitation' && (
          <InvitationBuilder eventId={eventId} event={event} />
        )}
        </div>
      </section>
    </div>
  );
}