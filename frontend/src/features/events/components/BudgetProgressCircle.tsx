import { budgetProgress } from '../budgetProgress';

export default function BudgetProgressCircle({ budget, spent }: { budget: number; spent: number }) {
  const { percentage, progress, overspent } = budgetProgress(budget, spent);
  const circumference = 2 * Math.PI * 48;
  const display = percentage.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="shrink-0 text-center" role="progressbar" aria-label="Budget Spent"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}
      aria-valuetext={`${display}% of budget spent${overspent ? ', over budget' : ''}`}>
      <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
          <circle cx={60} cy={60} r={48} fill="none" strokeWidth={8} className="stroke-[#351018]/10 dark:stroke-white/15" />
          <circle cx={60} cy={60} r={48} fill="none" strokeWidth={8} strokeLinecap="round"
            strokeOpacity={progress > 0 ? 1 : 0} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} transform="rotate(-90 60 60)"
            className={overspent ? 'stroke-red-600 dark:stroke-red-400' : 'stroke-[#351018] dark:stroke-[#D9A3AA]'} />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center px-3 text-lg font-semibold ${overspent ? 'text-red-600 dark:text-red-400' : 'text-[#351018] dark:text-white'}`}>{display}%</span>
      </div>
      <p className="mt-1 text-xs text-[#351018]/60 dark:text-white/70">Budget Spent</p>
    </div>
  );
}
