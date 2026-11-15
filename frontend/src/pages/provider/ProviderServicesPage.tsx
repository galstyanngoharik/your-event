import { Link } from 'react-router-dom';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useDeleteServiceMutation,
  useGetMyServicesQuery,
  serviceImage,
} from '../../features/services/servicesApi';

export default function ProviderServicesPage() {
  const { data: services = [], isLoading, isError, refetch } =
    useGetMyServicesQuery();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteService(id).unwrap();
    } catch {
      window.alert('Failed to delete service. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#351018]">My Services</h2>
          <p className="mt-1 text-sm text-[#351018]/60">
            Manage the services shown to event organizers.
          </p>
        </div>
        <Link
          to="/provider/services/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]"
        >
          <Plus size={18} /> Add New Service
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#351018]/60">Loading services...</p>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-red-600">
          Failed to load your services.
          <button onClick={() => refetch()} className="ml-2 underline">
            Try again
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-[#D9A3AA]/50 bg-white p-10 text-center">
          <p className="font-medium text-[#351018]">No services yet</p>
          <p className="mt-2 text-sm text-[#351018]/60">
            Add your first service to show it in the catalog.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-2xl border border-[#D9A3AA]/40 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
            >
              <Link to={`/provider/services/${service.id}`} className="block">
                {serviceImage(service.images?.[0]) ? (
                  <img
                    src={serviceImage(service.images[0]) || undefined}
                    alt={service.title}
                    className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-[#F2D9DC]/50 text-sm text-[#351018]/50">
                    No image
                  </div>
                )}
                <div className="space-y-2 p-5">
                  <p className="text-xs text-[#351018]/60">{service.category}</p>
                  <h3 className="font-semibold text-[#351018]">{service.title}</h3>
                  <p className="flex items-center gap-1 text-sm text-[#351018]/60">
                    <MapPin size={15} /> {service.city}
                  </p>
                  <p className="font-semibold text-[#351018]">
                    {Number(service.price).toLocaleString()} AMD
                  </p>
                  <p className="text-xs text-[#351018]/50">
                    {service.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 border-t border-[#D9A3AA]/30 p-4">
                <Link
                  to={`/provider/services/${service.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#351018]/15 px-3 py-2 text-sm text-[#351018] transition hover:bg-[#F2D9DC]/50"
                >
                  <Pencil size={15} /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(service.id, service.title)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#351018]/15 px-3 py-2 text-sm text-[#351018] transition hover:bg-[#F2D9DC]/50 disabled:opacity-50"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}