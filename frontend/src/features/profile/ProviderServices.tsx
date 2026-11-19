import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetServicesQuery } from '../services/servicesApi';
import SaveServiceButton from '../services/SaveServiceButton';

export default function ProviderServices({ providerId }: { providerId: number }) {
  const [offset, setOffset] = useState(0);
  const { currentData: data, isFetching, isError, refetch } = useGetServicesQuery({ providerId, offset });

  return (
    <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-[#351018]">Services</h2>
      {isFetching ? <p className="text-sm text-[#351018]/60">Loading services...</p> : isError ? (
        <p role="alert" className="text-sm text-red-600">Could not load services. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>
      ) : !data?.rows.length ? <p className="text-sm text-[#351018]/60">No services available yet.</p> : (
        <div className="divide-y divide-[#D9A3AA]/30">
          {data.rows.map((service) => (
            <div key={service.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
              <div>
                <Link to={`/organizer/services/${service.id}`} className="font-medium text-[#351018] hover:underline">{service.title}</Link>
                <p className="mt-1 text-sm text-[#351018]/60">{service.category} · {Number(service.price).toLocaleString()} AMD</p>
              </div>
              <SaveServiceButton serviceId={service.id} />
            </div>
          ))}
        </div>
      )}
      {data && data.count > 12 && (
        <div className="flex items-center justify-center gap-4 text-sm text-[#351018]">
          <button type="button" disabled={isFetching || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 12))} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {Math.floor(offset / 12) + 1}</span>
          <button type="button" disabled={isFetching || offset + 12 >= data.count} onClick={() => setOffset((value) => value + 12)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </section>
  );
}
