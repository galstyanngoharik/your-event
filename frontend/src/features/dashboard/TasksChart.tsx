import type { Analytics } from './analytics';

export default function TasksChart({ analytics }: { analytics: Analytics }) {
  const { completed, totalTasks, taskPercentage } = analytics;
  return (
    <section className="rounded-2xl border border-[#D9A3AA]/50 bg-[#FFFDFB] p-6 text-[#351018]">
      <h3 className="text-lg font-semibold">Tasks Progress</h3>
      <p className="mt-1 text-sm text-[#351018]/60">Current planning progress</p>
      <div className="relative mx-auto my-6 h-48 w-48">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r="82" fill="none" stroke="#F2D9DC" strokeWidth="12" />
          <circle cx="100" cy="100" r="82" pathLength="100" fill="none" stroke="#D9A3AA" strokeWidth="12"
            strokeLinecap={taskPercentage ? 'round' : 'butt'} strokeDasharray={`${taskPercentage} 100`}
            className="transition-all duration-700 motion-reduce:transition-none" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="progressbar"
          aria-label="Completed tasks" aria-valuenow={Math.round(taskPercentage)} aria-valuemin={0} aria-valuemax={100}
          aria-valuetext={`${completed} of ${totalTasks} tasks completed`}>
          <strong className="text-3xl">{taskPercentage.toFixed(0)}%</strong>
          <span className="mt-1 text-xs text-[#351018]/60">completed</span>
        </div>
      </div>
      <div className="flex justify-between gap-3 text-sm">
        <span title={`${completed} completed tasks`}>Completed <strong>{completed}</strong></span>
        <span title={`${totalTasks - completed} incomplete tasks`}>Incomplete <strong>{totalTasks - completed}</strong></span>
      </div>
      <p className="mt-4 text-sm text-[#351018]/60" role="status">
        {totalTasks ? `${completed} of ${totalTasks} tasks completed` : 'No tasks yet. Add tasks in your event to start planning.'}
      </p>
    </section>
  );
}
