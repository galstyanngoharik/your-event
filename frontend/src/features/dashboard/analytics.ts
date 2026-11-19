import { currencies, currencyCode, formatMoney, type CurrencyCode } from '../events/currency';
import type { AnalyticsEvent } from '../events/eventsApi';

export const money = formatMoney;
export const safeAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

const sumAmounts = (values: unknown[]) => values.reduce<number>(
  (sum, value) => sum + Math.round(safeAmount(value) * 100), 0
) / 100;

export function calculateAnalytics(events: AnalyticsEvent[], selected = 'all', now = Date.now(), requestedCurrency?: CurrencyCode) {
  const unique = [...new Map(events.map(event => [event.id, event])).values()];
  const scoped = selected === 'all' ? unique : unique.filter(event => String(event.id) === selected);
  const availableCurrencies = currencies.map(item => item.code).filter(code => scoped.some(event => currencyCode(event.currency) === code));
  const currency = requestedCurrency && availableCurrencies.includes(requestedCurrency)
    ? requestedCurrency : availableCurrencies[0] ?? 'AMD';
  const financialEvents = scoped.filter(event => currencyCode(event.currency) === currency);
  const expenses = [...new Map(financialEvents.flatMap(event => event.expenses).map(expense => [expense.id, expense])).values()];
  const tasks = [...new Map(scoped.flatMap(event => event.tasks).map(task => [task.id, task])).values()];
  const guests = new Set(scoped.flatMap(event => event.guests).map(guest => guest.id)).size;
  const budget = sumAmounts(financialEvents.map(event => event.budget));
  const spent = sumAmounts(expenses.map(expense => expense.amount));
  const completed = tasks.filter(task => task.completed).length;
  const categories = new Map<string, number>();
  for (const expense of expenses) {
    const category = expense.category?.trim() || 'Uncategorized';
    categories.set(category, (categories.get(category) || 0) + Math.round(safeAmount(expense.amount) * 100));
  }
  return {
    currency, availableCurrencies,
    events: scoped.length,
    completedEvents: scoped.filter(event => event.status === 'completed').length,
    upcoming: scoped.filter(event => new Date(event.date).getTime() >= now && event.status !== 'cancelled').length,
    guests, budget, spent, remaining: (Math.round(budget * 100) - Math.round(spent * 100)) / 100, completed, totalTasks: tasks.length,
    taskPercentage: tasks.length ? completed / tasks.length * 100 : 0,
    categories: [...categories].sort((a, b) => b[1] - a[1]).map(([name, cents]) => ({
      name, amount: cents / 100, percentage: spent ? cents / (spent * 100) * 100 : 0,
    })),
  };
}

export type Analytics = ReturnType<typeof calculateAnalytics>;
