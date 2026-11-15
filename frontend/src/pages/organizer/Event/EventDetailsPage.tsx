import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Wallet,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react';

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
const tabs = ['Overview', 'Tasks', 'Budget', 'Guests', 'Invitation', 'Moodboard'];

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

  const details = [
    {
      label: 'Date',
      value: new Date(event.date).toLocaleDateString(),
      icon: CalendarDays,
    },
    {
      label: 'Location',
      value: event.city,
      icon: MapPin,
    },
    {
      label: 'Budget',
      value: `${Number(event.budget).toLocaleString()} AMD`,
      icon: Wallet,
    },
    {
      label: 'Expected Guests',
      value: event.expectedGuests,
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-sm text-[#351018]/60 hover:text-[#351018]"
      >
        <ArrowLeft size={18} />
        Back to Events
      </Link>

      <section className="rounded-2xl border border-[#351018]/10 bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="rounded-full bg-[#351018]/5 px-3 py-1 text-xs capitalize text-[#351018]">
              {event.status}
            </span>

            <h1 className="mt-5 text-3xl font-semibold text-[#351018]">
              {event.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#351018]/60">
              {event.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/organizer/events/${eventId}/edit`}
              className="flex items-center gap-2 rounded-xl border border-[#351018]/20 px-4 py-2.5 text-sm text-[#351018]"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-xl bg-[#351018] px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {details.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[#351018]/10 p-5"
            >
              <Icon size={21} className="mb-4 text-[#351018]" />

              <p className="text-xs text-[#351018]/50">{label}</p>

              <p className="mt-2 font-semibold text-[#351018]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#351018]/10 bg-white p-6">
        <div className="flex gap-6 overflow-x-auto border-b border-[#351018]/10">
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
            budget={Number(event.budget)}
            />
        )}

        {activeTab === 'Guests' && (
            <GuestsTab eventId={eventId} />
        )}

        {activeTab === 'Invitation' && (
          <InvitationBuilder eventId={eventId} event={event} />
        )}
        </div>
      </section>
    </div>
  );
}