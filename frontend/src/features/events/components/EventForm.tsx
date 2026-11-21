
import { useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';

import EventBudgetFields from './EventBudgetFields';
import { currencyCode } from '../currency';
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
  currency: 'AMD',
  expectedGuests: 0,
  status: 'planning',
};

const inputClass =
  'w-full rounded-xl border border-[#351018]/15 bg-white px-4 py-3 text-sm text-[#351018] outline-none transition focus:border-[#351018]';

const labelClass =
  'mb-2 block text-sm font-medium text-[#351018]';

const toLocalDateTime = (value: string): string => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

export default function EventForm({
  initialValues = emptyValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Event',
}: EventFormProps) {
  const [form, setForm] = useState<EventPayload>(initialValues);

  const [budget, setBudget] = useState<string>(
    initialValues.budget === 0
      ? ''
      : String(initialValues.budget)
  );

  const [date, setDate] = useState<string>(() =>
    toLocalDateTime(initialValues.date)
  );

  const [error, setError] = useState('');

  const handleChange = <K extends keyof EventPayload>(
    field: K,
    value: EventPayload[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !date || !form.city.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const budgetNumber = budget.trim() === '' ? 0 : Number(budget);
    const guestsNumber = Number(form.expectedGuests);
    const selectedDate = new Date(date);

    if (
      !Number.isFinite(budgetNumber) ||
      budgetNumber < 0 ||
      !Number.isFinite(guestsNumber) ||
      !Number.isInteger(guestsNumber) ||
      guestsNumber < 0
    ) {
      setError('Please enter a valid budget and guest count.');
      return;
    }

    if (Number.isNaN(selectedDate.getTime())) {
      setError('Please select a valid date and time.');
      return;
    }

    const payload: EventPayload = {
      ...form,
      budget: budgetNumber,
      expectedGuests: guestsNumber,
      date: selectedDate.toISOString(),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      setError('Failed to save event. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
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
            <label htmlFor="event-date" className={labelClass}>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                Date & Time *
              </span>
            </label>

            <input
              id="event-date"
              type="datetime-local"
              step="60"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

        <div className="grid gap-5 md:grid-cols-3">
          <EventBudgetFields
            budget={budget}
            currency={currencyCode(form.currency)}
            setBudget={setBudget}
            setCurrency={(value) => handleChange('currency', value)}
            inputClass={inputClass}
            labelClass={labelClass}
          />

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
              step="1"
              className={inputClass}
              value={form.expectedGuests}
              onChange={(e) =>
                handleChange('expectedGuests', Number(e.target.value))
              }
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-[#351018]/60">
          Budget and expenses use this currency. Changing it does not
          convert existing amounts.
        </p>
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
