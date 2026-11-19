import { useState } from 'react';
import type { Analytics } from './analytics';
import { money } from './analytics';

const colors = ['#8F616C', '#D9A3AA', '#BA8990', '#C6AD85', '#8F616C', '#E7BDC3', '#A58C78'];

export default function BudgetChart({ analytics }: { analytics: Analytics }) {
  const [active, setActive] = useState<string | null>(null);
  const { categories, spent, remaining, currency } = analytics;
  const hovered = categories.find(category => category.name === active);
  let offset = 0;
  const segments = [];
  for (const category of categories) {
    segments.push({ ...category, start: offset });
    offset += category.percentage;
  }
  return (
    <section className="rounded-2xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-6 text-[#351018]">
      <h3 className="text-lg font-semibold">Budget Breakdown</h3>
      <p className="mt-1 text-sm text-[#351018]/60">Expense categories · share of total spending</p>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-52 w-52 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label={`Total spent ${money(spent, currency)}`}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#F2D9DC" strokeWidth="22" />
            {segments.map((category, index) => {
              return (
                <circle key={category.name} cx="100" cy="100" r="80" pathLength="100" fill="none"
                  stroke={colors[index % colors.length]} strokeWidth={active === category.name ? 28 : 22}
                  strokeDasharray={`${category.percentage} ${100 - category.percentage}`} strokeDashoffset={-category.start}
                  className="transition-all duration-300 motion-reduce:transition-none"
                  onMouseEnter={() => setActive(category.name)} onMouseLeave={() => setActive(null)}>
                  <title>{`${category.name}: ${money(category.amount, currency)} (${category.percentage.toFixed(1)}%)`}</title>
                </circle>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-xs text-[#351018]/60">Total spent</span>
            <strong className="mt-1 w-full break-words text-lg">{spent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            <span className="text-xs">{currency}</span>
          </div>
        </div>
        <ul className="max-h-64 w-full min-w-0 space-y-2 overflow-y-auto text-sm">
          {categories.map((category, index) => (
            <li key={category.name}>
              <button type="button" onMouseEnter={() => setActive(category.name)} onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(category.name)} onBlur={() => setActive(null)}
                onClick={() => setActive(active === category.name ? null : category.name)}
                aria-pressed={active === category.name}
                className="flex w-full items-start gap-2 rounded-lg p-2 text-left transition hover:bg-[#F2D9DC]/30 focus-visible:outline focus-visible:outline-[#D9A3AA] motion-reduce:transition-none">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: colors[index % colors.length] }} />
                <span className="min-w-0 flex-1 break-words">{category.name}<span className="block text-xs text-[#351018]/60">{money(category.amount, currency)}</span></span>
                <span>{category.percentage.toFixed(1)}%</span>
              </button>
            </li>
          ))}
          {!categories.length && <li className="text-[#351018]/60">No expenses yet.</li>}
        </ul>
      </div>
      <p className="mt-4 min-h-5 text-sm" role="status">
        {hovered ? `${hovered.name}: ${money(hovered.amount, currency)} · ${hovered.percentage.toFixed(1)}%` :
          remaining < 0 ? `Over budget by ${money(-remaining, currency)}` : `Remaining budget: ${money(remaining, currency)}`}
      </p>
    </section>
  );
}
