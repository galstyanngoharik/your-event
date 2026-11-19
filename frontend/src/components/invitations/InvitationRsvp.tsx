import { CheckCircle2, XCircle, Send } from 'lucide-react';

type RsvpStatus = 'going' | 'declined';

interface Props {
  submitted: boolean;
  name: string;
  setName: (name: string) => void;
  selectedStatus: RsvpStatus | null;
  setSelectedStatus: (status: RsvpStatus) => void;
  error: string;
  isSubmitting: boolean;
  buttonClass: string;
  handleSubmit: () => Promise<void>;
}

export default function InvitationRsvp({ submitted, name, setName, selectedStatus,
  setSelectedStatus, error, isSubmitting, buttonClass, handleSubmit }: Props) {
  return (
    <>
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
    </>
  );
}
