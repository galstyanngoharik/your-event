
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Heart,
  CheckCircle2,
  XCircle,
  Send,
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
  console.log('PUBLIC INVITATION DATA:', data);

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

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendUrl = apiUrl.replace(/\/api\/?$/, '');

const backgroundImage = data.backgroundImage
  ? data.backgroundImage.startsWith('http')
    ? data.backgroundImage
    : `${backendUrl}${data.backgroundImage.startsWith('/') ? '' : '/'}${data.backgroundImage}`
  : null;

const backgrounds = {
  cream: 'bg-[#FFF8F1]',
  blush: 'bg-[#F2D9DC]',
  white: 'bg-white',
  burgundy: 'bg-[#351018]',
};
const textColors = {
  burgundy: 'text-[#351018]',
  white: 'text-white',
  dustyRose: 'text-[#A96D79]',
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
const isDark = data.backgroundColor === 'burgundy' || data.theme === 'dark';
   
return (
  <div
    className={`relative min-h-screen overflow-hidden px-4 py-12 sm:px-6 ${backgroundImage ? 'bg-[#351018]' : backgroundClass}`}
  >
    {backgroundImage && <img src={backgroundImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
    {backgroundImage && <div className="absolute inset-0 bg-black/20" />}
    <div className="relative z-10 mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-center gap-2">
        <Heart
          size={20}
          className={isDark && !backgroundImage ? 'text-white' : 'text-[#351018]'}
        />

        <span
          className={`text-lg font-bold tracking-wide ${
            isDark && !backgroundImage ? 'text-white' : 'text-[#351018]'
          }`}
        >
          YourEvent
        </span>
      </div>

      <div className={`overflow-hidden rounded-3xl border p-8 shadow-xl sm:p-12 ${templateBorders[data.template] || templateBorders.classic} ${backgroundImage ? 'bg-white/85' : backgroundClass}`}>
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

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2
              size={48}
              className="mx-auto text-green-500"
            />

            <h2 className="mt-5 text-2xl font-semibold text-[#351018]">
              Thank You!
            </h2>

            <p className="mt-3 text-sm text-[#351018]/60">
              Your response has been submitted successfully.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-center text-xl font-semibold text-[#351018]">
              Will You Join Us?
            </h2>

            <p className="mt-2 text-center text-sm text-[#351018]/60">
              Please let us know if you can attend.
            </p>

            <div className="mt-8">
              <label
                htmlFor="guest-name"
                className="mb-2 block text-sm font-medium text-[#351018]"
              >
                Your Name
              </label>

              <input
                id="guest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-[#351018]/15 bg-white px-4 py-3 text-sm text-[#351018] placeholder:text-[#351018]/40 outline-none focus:border-[#351018]/50"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('going')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                  selectedStatus === 'going'
                    ? 'border-green-500 bg-green-500/10 text-green-600'
                    : 'border-[#351018]/15 text-[#351018]'
                }`}
              >
                <CheckCircle2 size={20} />
                I'll Be There
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('declined')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                  selectedStatus === 'declined'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-[#351018]/15 text-[#351018]'
                }`}
              >
                <XCircle size={20} />
                Can't Attend
              </button>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold disabled:opacity-50 ${buttonClass}`}
            >
              <Send size={18} />
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        )}
      </div>

      <p
        className={`mt-8 text-center text-xs ${
          isDark && !backgroundImage
            ? 'text-white/50'
            : 'text-[#351018]/60'
        }`}
      >
        Made with YourEvent
      </p>
    </div>
  </div>
);
}
