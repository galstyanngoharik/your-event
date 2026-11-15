import { useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Wallet, Users } from 'lucide-react';

import type { EventPayload } from '../eventsApi';

interface EventFormProps {
  initialValues?: EventPayload;
  onSubmit: (data: EventPayload) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const emptyValues: EventPayload = {
  title: '',
  type: 'birthday',
  description: '',
  date: '',
  city: '',
  address: '',
  budget: 0,
  expectedGuests: 0,
  status: 'planning',
};

const inputClass =
  'w-full rounded-xl border border-[#351018]/15 bg-white px-4 py-3 text-sm text-[#351018] outline-none transition focus:border-[#351018]';

const labelClass = 'mb-2 block text-sm font-medium text-[#351018]';

export default function EventForm({
  initialValues = emptyValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Event',
}: EventFormProps) {
  const [form, setForm] = useState<EventPayload>(initialValues);
  const [error, setError] = useState('');

  const handleChange = <K extends keyof EventPayload>(
    field: K,
    value: EventPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.date || !form.city.trim()) {
        setError('Please fill in all required fields.');
        return;
    }

    if (
        !Number.isFinite(Number(form.budget)) ||
        !Number.isFinite(Number(form.expectedGuests)) ||
        Number(form.budget) < 0 ||
        Number(form.expectedGuests) < 0
    ) {
        setError('Budget and expected guests cannot be negative.');
        return;
    }
    try {
        await onSubmit(form);
    } catch (err) {
        console.log(err);
        setError('Failed to save event. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl space-y-8"
    >
      <div className="rounded-2xl border border-[#351018]/10 bg-white p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#351018]">
            Event Information
          </h2>
          <p className="mt-2 text-sm text-[#351018]/50">
            Tell us about the event you're planning.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Event Name *</label>
            <input
              className={inputClass}
              placeholder="e.g. My Birthday Party"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Event Type *</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="birthday">Birthday Party</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate Event</option>
              <option value="party">Private Party</option>
              <option value="party">Graduation Party</option>
              <option value="party">HouseWarming</option>
              <option value="party">Team-building event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-28 resize-none`}
              placeholder="Describe your event..."
              value={form.description}
              onChange={(e) =>
                handleChange('description', e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                Date & Time *
              </span>
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  City *
                </span>
              </label>
              <input
                className={inputClass}
                placeholder="Yerevan"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Venue / Address</label>
              <input
                className={inputClass}
                placeholder="Restaurant or venue address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#351018]/10 bg-white p-6 md:p-8">
        <h2 className="mb-6 text-xl font-semibold text-[#351018]">
          Planning Details
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2">
                <Wallet size={16} />
                Total Budget (AMD)
              </span>
            </label>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.budget}
              onChange={(e) =>
                handleChange('budget', Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2">
                <Users size={16} />
                Expected Guests
              </span>
            </label>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.expectedGuests}
              onChange={(e) =>
                handleChange('expectedGuests', Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-[#351018] px-8 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}