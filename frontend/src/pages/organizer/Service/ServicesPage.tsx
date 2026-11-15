
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import {
  useGetServicesQuery,
  serviceImage,
  type ServiceFilters,
} from '../../../features/services/servicesApi';
import { useSearchProvidersQuery } from '../../../features/profile/providersApi';

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

export default function ServicesPage() {
  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    city: '',
    category: '',
    maxPrice: '',
    sort: 'newest',
    offset: 0,
  });

  const { data, isLoading, isError, refetch } =
    useGetServicesQuery(filters);
  const deferredSearch = useDeferredValue((filters.search ?? '').trim());
  const { data: providers = [], isFetching: isSearchingProviders } =
    useSearchProvidersQuery(deferredSearch, {
      skip: deferredSearch.length < 2,
    });

  const update = (key: keyof ServiceFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));

  const input =
    'w-full rounded-xl border border-[#351018]/15 bg-white px-4 py-3 text-sm outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#351018]">
          Services Catalog
        </h1>
        <p className="text-sm text-gray-500">
          Find services for your event.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-4">
        <input
          className={input}
          placeholder="City"
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
        />

        <select
          className={input}
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
          className={input}
          placeholder="Maximum price (AMD)"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
        />

        <select
          className={input}
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
            className={`${input} pl-10`}
            placeholder="Search services or providers"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
      </div>

      {deferredSearch.length >= 2 && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="text-lg font-semibold text-[#351018]">
            Providers
          </h2>
          {isSearchingProviders ? (
            <p className="text-sm text-gray-500">Searching providers...</p>
          ) : providers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  to={`/organizer/providers/${provider.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[#351018]/10 bg-white p-4 hover:border-[#351018]/30"
                >
                  {provider.avatar ? (
                    <img
                      src={serviceImage(provider.avatar) || undefined}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#351018]/10 font-semibold text-[#351018]">
                      {(provider.businessName || provider.name).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[#351018]">
                      {provider.businessName || provider.name}
                    </span>
                    {provider.businessName && (
                      <span className="block truncate text-sm text-gray-500">
                        {provider.name}
                      </span>
                    )}
                    <span className="block truncate text-xs text-gray-500">
                      {provider.workingCities.join(', ')}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No providers found for “{deferredSearch}”.
            </p>
          )}
        </section>
      )}

      {isLoading ? (
        <p>Loading services...</p>
      ) : isError ? (
        <div className="text-red-600">
          Failed to load services.
          <button onClick={() => refetch()} className="ml-2 underline">
            Try again
          </button>
        </div>
      ) : !data?.rows.length ? (
        <p className="rounded-2xl bg-white p-10 text-center text-gray-500">
          No services found.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {data.count} services found
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.rows.map((service) => (
              <Link
                key={service.id}
                to={`/organizer/services/${service.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                
              <div className="overflow-hidden">
                {serviceImage(service.images?.[0]) ? (
                  <img
                    src={serviceImage(service.images[0])!}
                    alt={service.title}
                    className="h-44 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gray-100 text-gray-400">
                    No image
                  </div>
                )}
              </div>


                <div className="space-y-2 p-5">
                  <p className="text-xs text-gray-500">
                    {service.category}
                  </p>
                  <h2 className="font-semibold text-[#351018]">
                    {service.title}
                  </h2>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={15} /> {service.city}
                  </p>
                  <p className="font-semibold text-[#351018]">
                    {Number(service.price).toLocaleString()} AMD
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {data.count > 12 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={!filters.offset}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    offset: Math.max(0, (prev.offset || 0) - 12),
                  }))
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {Math.floor((filters.offset || 0) / 12) + 1}
              </span>

              <button
                disabled={(filters.offset || 0) + 12 >= data.count}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    offset: (prev.offset || 0) + 12,
                  }))
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
