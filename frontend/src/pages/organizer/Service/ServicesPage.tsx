import ServicesFilters from '../../../features/services/ServicesFilters';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import {
  useGetServicesQuery,
  serviceImage,
  type ServiceFilters,
} from '../../../features/services/servicesApi';
import { useSearchProvidersQuery } from '../../../features/profile/providersApi';

export default function ServicesPage() {
  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    city: '',
    category: '',
    maxPrice: '',
    sort: 'newest',
    offset: 0,
  });

  const { currentData: data, isFetching, isError, refetch } =
    useGetServicesQuery(filters);
  const search = (filters.search ?? '').trim();
  const { currentData: providers = [], isFetching: isSearchingProviders, isError: providerError } =
    useSearchProvidersQuery({ search, city: filters.city, category: filters.category, maxPrice: filters.maxPrice }, {
      skip: search.length < 2,
    });

  const update = (key: keyof ServiceFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));

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

      <ServicesFilters filters={filters} update={update} />

      {search.length >= 2 && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="text-lg font-semibold text-[#351018]">
            Providers
          </h2>
          {isSearchingProviders ? (
            <p className="text-sm text-gray-500">Searching providers...</p>
          ) : providerError ? (
            <p className="text-sm text-red-600">Failed to load providers. Try adjusting your search.</p>
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
              No providers found for “{search}”.
            </p>
          )}
        </section>
      )}

      {isFetching ? (
        <p>Loading services...</p>
      ) : isError ? (
        <div className="text-red-600">
          Failed to load services.
          <button onClick={() => refetch()} className="ml-2 underline">
            Try again
          </button>
        </div>
      ) : !data?.rows.length ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
          <h2 className="font-semibold text-[#351018]">No services found</h2>
          <p className="mt-2">Try another city or adjust your search.</p>
          <button className="mt-4 underline" onClick={() => setFilters({ search: '', city: '', category: '', maxPrice: '', sort: 'newest', offset: 0 })}>
            Clear Filters
          </button>
        </div>
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
