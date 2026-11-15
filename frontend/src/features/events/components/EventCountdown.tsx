import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';

interface Props {
  date: string | null | undefined;
  title?: string;
}

const getTargetTime = (value: string | null | undefined) => {
  if (!value) return null;
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const target = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 23, 59, 59, 999).getTime()
    : new Date(value).getTime();
  return Number.isFinite(target) ? target : null;
};

export default function EventCountdown({ date, title }: Props) {
  const targetTime = getTargetTime(date);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetTime === null || targetTime <= Date.now()) return;
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [targetTime]);

  if (targetTime === null) {
    return (
      <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
        <p className="text-sm text-[#351018]/60">Event date unavailable.</p>
      </section>
    );
  }

  const remaining = targetTime - now;
  if (remaining <= 0) {
    return (
      <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
        {title && <h3 className="mb-2 font-semibold text-[#351018]">{title}</h3>}
        <p className="text-sm text-[#351018]/60">Event date has passed.</p>
      </section>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const values = [
    { label: 'Days', value: Math.floor(totalSeconds / 86400) },
    { label: 'Hours', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Seconds', value: totalSeconds % 60 },
  ];

  return (
    <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[#351018]">
        <CalendarClock size={19} className="text-[#D9A3AA]" />
        {title || 'Your Special Day Is Almost Here'}
      </h3>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {values.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#F2D9DC] bg-[#FFF8F1] px-2 py-3 text-center sm:px-4">
            <p className="tabular-nums text-xl font-semibold text-[#351018] sm:text-2xl">{String(value).padStart(2, '0')}</p>
            <p className="mt-1 text-[10px] text-[#351018]/60 sm:text-xs">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
