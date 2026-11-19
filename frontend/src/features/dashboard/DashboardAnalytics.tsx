import { currencyCode, type CurrencyCode } from '../events/currency';
import { useState } from 'react';
import { CalendarDays, CalendarCheck, CheckCircle2, ListTodo, Users, Wallet } from 'lucide-react';
import type { AnalyticsEvent } from '../events/eventsApi';
import { calculateAnalytics, money } from './analytics';
import BudgetChart from './BudgetChart';
import TasksChart from './TasksChart';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading dashboard analytics">
      <div className="h-12 rounded-xl bg-[#D9A3AA]/20 motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-[#D9A3AA]/20 motion-safe:animate-pulse" />)}
      </div>
    </div>
  );
}

export default function DashboardAnalytics({ events, refreshing, now }: { events: AnalyticsEvent[]; refreshing: boolean; now: number }) {
  const [financialCurrency, setFinancialCurrency] = useState<CurrencyCode>('AMD');
  const [selection, setSelection] = useState('all');
  const selected = events.some(event => String(event.id) === selection) ? selection : 'all';
  const analytics = calculateAnalytics(events, selected, now, financialCurrency);
  const stats = [
    { label: 'Total Events', value: analytics.events, icon: CalendarDays },
    { label: 'Upcoming Events', value: analytics.upcoming, icon: CalendarCheck },
    { label: 'Completed Events', value: analytics.completedEvents, icon: CheckCircle2 },
    { label: 'Total Guests', value: analytics.guests, icon: Users },
    { label: 'Completed Tasks', value: `${analytics.completed} / ${analytics.totalTasks}`, icon: ListTodo },
    { label: 'Total Budget', value: money(analytics.budget, analytics.currency), icon: Wallet },
    { label: 'Total Expenses', value: money(analytics.spent, analytics.currency), icon: Wallet },
    { label: 'Remaining Budget', value: money(analytics.remaining, analytics.currency), icon: Wallet },
  ];
  return (
    <section className="space-y-5" aria-label="Event analytics" aria-busy={refreshing}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#351018]">Event Analytics</h3>
        <label className="flex items-center gap-3 text-sm text-[#351018]">
          Event
          <select value={selected} onChange={event => setSelection(event.target.value)}
            className="w-48 max-w-full rounded-xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-3 sm:w-64">
            <option value="all">All Events</option>
            {events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
        </label>
      </div>
      {analytics.availableCurrencies.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#351018]">
          <label className="flex items-center gap-2">
            Budget currency
            <select value={analytics.currency} onChange={event => setFinancialCurrency(currencyCode(event.target.value))}
              className="rounded-xl border border-[#D9A3AA]/50 bg-[#FFFDFB] px-3 py-2">
              {analytics.availableCurrencies.map(code => <option key={code} value={code}>{code}</option>)}
            </select>
          </label>
          <p className="text-xs text-[#351018]/60">Money totals and budget breakdown include {analytics.currency} events only. No currency conversion.</p>
        </div>
      )}
      {refreshing && <p className="text-xs text-[#351018]/60" role="status">Updating analytics…</p>}
      {!events.length && <p className="text-sm text-[#351018]/60">Create your first event to start tracking your plans.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="ye-stat min-w-0 rounded-2xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-5 text-[#351018] transition duration-300 hover:border-[#D9A3AA] hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#D9A3AA]/40">
              <Icon size={21} />
            </div>
            <p className="text-sm text-[#351018]/60">{label}</p>
            <p className="mt-3 break-words text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <BudgetChart analytics={analytics} />
        <TasksChart analytics={analytics} />
      </div>
    </section>
  );
}
