import InvitationTemplateBackground from '../../components/invitations/InvitationTemplateBackground';
import InvitationEnvelope from '../../components/invitations/InvitationEnvelope';
import InvitationRsvp from '../../components/invitations/InvitationRsvp';
import InvitationPhoto from '../../components/invitations/InvitationPhoto';

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Heart,
} from 'lucide-react';

import {
  useGetPublicInvitationQuery,
  useSubmitRsvpMutation,
} from '../../features/events/invitationsApi';

type RsvpStatus = 'going' | 'declined';

export default function PublicInvitationPage() {
  const { token } = useParams<{ token: string }>();

  const [name, setName] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState<RsvpStatus | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    data,
    isLoading,
    isError,
  } = useGetPublicInvitationQuery(token ?? '', {
    skip: !token,
  });

  const [submitRsvp, { isLoading: isSubmitting }] =
    useSubmitRsvpMutation();

  const handleSubmit = async () => {
    if (!token || !name.trim() || !selectedStatus) {
      setError('Please enter your name and select a response.');
      return;
    }

    setError('');

    try {
      await submitRsvp({
        token,
        name: name.trim(),
        status: selectedStatus,
      }).unwrap();

      setSubmitted(true);
    } catch (err) {
      console.log(err);
      setError('Failed to submit your response. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#351018]/60">
          Loading invitation...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#351018]">
            Invitation not found
          </h1>

          <p className="mt-3 text-sm text-[#351018]/60">
            This invitation may be unavailable or unpublished.
          </p>
        </div>
      </div>
    );
  }
  const { Event: event } = data;

  if (!event) {
    return <div className="p-8 text-center">Event not found.</div>;
  }

  const backgrounds = {
    cream: 'bg-[#FFF8F1]',
    dustyRose: 'bg-[#D9A3AA]',
    blush: 'bg-[#F2D9DC]',
    white: 'bg-white',
    burgundy: 'bg-[#351018]',
  };
  const textColors = {
    burgundy: 'text-[#351018]',
    white: 'text-white',
    dustyRose: 'text-[#A96D79]',
    black: 'text-black',
  };
  const templateBorders = {
    romantic: 'border-[#D9A3AA]/60',
    classic: 'border-[#D9A3AA]/35',
    modern: 'border-[#351018]/10',
  };
  const backgroundClass = backgrounds[data.backgroundColor] || (data.theme === 'soft' ? backgrounds.blush : data.theme === 'dark' ? backgrounds.burgundy : backgrounds.cream);
  const accentClass = textColors[data.textColor] || 'text-[#351018]';
  const buttonClass = data.textColor === 'white' ? 'bg-[#D9A3AA] text-[#351018]' : 'bg-[#351018] text-white';
  const headingClass = data.headingStyle === 'sans' ? 'font-sans' : 'font-serif';

  return (
    <div
      className="min-h-svh bg-[#FFF8F1]"
    >
      <InvitationEnvelope key={token} envelope={data.envelope} background={data.backgroundTemplate ? <InvitationTemplateBackground template={data.backgroundTemplate} /> : <InvitationPhoto imageUrl={data.backgroundImage} background />}>
        <div className="mb-8 flex items-center justify-center gap-2">
          <Heart
            size={20}
            className="text-[#351018]"
          />

          <span
            className="text-lg font-bold tracking-wide text-[#351018]"
          >
            YourEvent
          </span>
        </div>

        <div className={`relative isolate overflow-hidden rounded-3xl border shadow-xl ${templateBorders[data.template] || templateBorders.classic} ${backgroundClass}`}>
          {data.backgroundTemplate && !data.backgroundImage && <InvitationTemplateBackground template={data.backgroundTemplate} />}
          <InvitationPhoto imageUrl={data.backgroundImage} background />
          <div className={`relative p-8 sm:p-12 ${data.backgroundImage || data.backgroundTemplate ? 'bg-white/85' : ''}`}>
            <div className="mb-8 text-center">
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${accentClass} opacity-60`}>
                You're Invited
              </p>

              <Heart size={32} className={`mx-auto my-6 ${accentClass}`} />

              <h1 className={`text-3xl font-semibold sm:text-5xl ${headingClass} ${accentClass}`}>
                {data.title || event.title}
              </h1>

              {data.message && (
                <p className={`mx-auto mt-6 max-w-md leading-7 ${accentClass} opacity-80`}>
                  {data.message}
                </p>
              )}
            </div>

            <div className={`my-10 border-t ${data.textColor === 'white' ? 'border-white/30' : 'border-[#351018]/10'}`} />

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CalendarDays size={22} className={accentClass} />

                <div>
                  <p className={`text-sm font-semibold ${accentClass}`}>
                    Date & Time
                  </p>

                  <p className={`mt-1 text-sm ${accentClass} opacity-75`}>
                    {new Date(event.date).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={22} className={accentClass} />

                <div>
                  <p className={`text-sm font-semibold ${accentClass}`}>
                    Location
                  </p>

                  <p className={`mt-1 text-sm ${accentClass} opacity-75`}>
                    {[event.city, event.address].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className={`my-10 border-t ${data.textColor === 'white' ? 'border-white/30' : 'border-[#351018]/10'}`} />

            <div className={data.textColor === 'white' ? 'rounded-2xl bg-[#FFF8F1] p-4 sm:p-6' : ''}>
              <InvitationRsvp submitted={submitted} name={name} setName={setName}
                selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} error={error}
                isSubmitting={isSubmitting} buttonClass={buttonClass} handleSubmit={handleSubmit} />
            </div>
          </div>
        </div>

        <p
          className="mt-8 text-center text-xs text-[#351018]/60"
        >
          Made with YourEvent
        </p>
      </InvitationEnvelope>
    </div>
  );
}
