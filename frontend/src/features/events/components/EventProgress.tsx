import { useGetTasksQuery, type Task } from '../tasksApi';

interface Props {
  eventId: number;
  eventTitle: string;
  tasks?: Task[];
}

export default function EventProgress({ eventId, eventTitle, tasks: suppliedTasks }: Props) {
  const { data: fetchedTasks = [], isLoading, isError, refetch } = useGetTasksQuery(eventId, { skip: suppliedTasks !== undefined });
  const tasks = suppliedTasks ?? fetchedTasks;

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
        <p className="text-sm text-[#351018]/60">Loading planning progress...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
        <p className="text-sm text-red-600">Could not load planning progress. <button onClick={() => refetch()} className="underline">Try again</button></p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
        <h3 className="font-semibold text-[#351018]">{eventTitle} Preparation</h3>
        <p className="mt-2 text-sm text-[#351018]/60">No tasks added yet.</p>
      </section>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <section className="space-y-3 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-[#351018]">{eventTitle} Preparation</h3>
        <span className="text-lg font-semibold tabular-nums text-[#351018]">{progress}%</span>
      </div>
      <svg
        role="progressbar"
        aria-label={`${eventTitle} planning progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="h-3 w-full overflow-hidden rounded-full"
      >
        <rect width="100" height="8" className="fill-[#F2D9DC]" />
        <rect width={progress} height="8" className="fill-[#351018] transition-all duration-500 motion-reduce:transition-none" />
      </svg>
      <p className="text-sm text-[#351018]/60">{completedTasks} of {tasks.length} tasks completed</p>
      {progress === 100 && <p role="status" className="rounded-xl bg-[#FFF8F1] p-3 text-sm font-medium text-[#351018]">Your event is ready to celebrate!</p>}
    </section>
  );
}
