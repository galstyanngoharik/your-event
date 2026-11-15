import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (rating: number) => void;
  label?: string;
  size?: number;
}

export default function RatingStars({ value, onChange, label = 'Rating', size = 20 }: Props) {
  const [hovered, setHovered] = useState(0);
  const displayedValue = hovered || value;

  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const active = rating <= displayedValue;
        const icon = (
          <Star
            size={size}
            aria-hidden="true"
            className={active ? 'fill-[#D9A3AA] text-[#351018]' : 'fill-transparent text-[#351018]/25'}
          />
        );

        return onChange ? (
          <button
            key={rating}
            type="button"
            aria-label={`${label}: ${rating} ${rating === 1 ? 'star' : 'stars'}`}
            aria-pressed={value === rating}
            onMouseEnter={() => setHovered(rating)}
            onFocus={() => setHovered(rating)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(rating)}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#D9A3AA]"
          >
            {icon}
          </button>
        ) : (
          <span key={rating}>{icon}</span>
        );
      })}
    </div>
  );
}