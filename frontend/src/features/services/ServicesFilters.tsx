import { Search } from 'lucide-react';
import type { ServiceFilters } from './servicesApi';

const serviceCategories = [
  { label: 'Catering', query: 'catering' },
  { label: 'Venue rental', query: 'venue' },
  { label: 'Event planning and coordination', query: 'planning' },
  { label: 'Photography and videography', query: 'photograph' },
  { label: 'DJ', query: 'music' },
  { label: 'Decoration', query: 'decoration' },
  { label: 'Cake and desserts', query: 'dessert' },
  { label: 'Invitations and printing', query: 'invitation' },
  { label: 'Transportation', query: 'transportation' },
  { label: 'Audio-visual (AV) and lighting', query: 'audio' },
  { label: 'Security and staff', query: 'security' },
  { label: 'Hosting', query: 'hosting' },
];

export default function ServicesFilters({ filters, update }: {
  filters: ServiceFilters;
  update: (key: keyof ServiceFilters, value: string) => void;
}) {
  const input =
    'w-full rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none';

  return (
    <div className="ye-service-filters grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-4">
      <input
        className={`${input} bg-[#351018]/10`}
        placeholder="City"
        aria-label="City"
        value={filters.city}
        onChange={(e) => update('city', e.target.value)}
      />

      <select
        className={`${input} bg-[#351018]/10`}
        value={filters.category}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">All categories</option>
        {serviceCategories.map((category) => (
          <option key={category.query} value={category.query}>
            {category.label}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        className={`${input} bg-[#351018]/10`}
        placeholder="Maximum price"
        value={filters.maxPrice}
        onChange={(e) => update('maxPrice', e.target.value)}
      />

      <select
        className={`${input} bg-[#351018]/10`}
        value={filters.sort}
        onChange={(e) => update('sort', e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>

      <div className="relative md:col-span-4">
        <Search
          size={18}
          className="absolute left-3 top-3.5 text-gray-400"
        />
        <input
          className={`${input} bg-white pl-10`}
          placeholder="Search services or providers"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>
    </div>
  );
}
