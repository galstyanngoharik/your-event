import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react';
import { useGetMyServicesQuery, serviceImage } from '../../features/services/servicesApi';

export default function ProviderServiceDetailsPage() {
  const { id } = useParams();
  const serviceId = Number(id);
  const { data: services = [], isLoading, isError, refetch } = useGetMyServicesQuery();
  const service = services.find((item) => item.id === serviceId);

  if (isLoading) return <p className="text-sm text-[#351018]/60">Loading service...</p>;
  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-6 text-red-600">
        Failed to load service.
        <button onClick={() => refetch()} className="ml-2 underline">Try again</button>
      </div>
    );
  }
  if (!service) return <p className="rounded-2xl bg-white p-6 text-[#351018]">Service not found in your account.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/provider/services" className="inline-flex items-center gap-2 text-sm text-[#351018]">
        <ArrowLeft size={17} /> Back to My Services
      </Link>
      <article className="overflow-hidden rounded-2xl border border-[#D9A3AA]/40 bg-white">
        {serviceImage(service.images?.[0]) ? (
          <img src={serviceImage(service.images[0]) || undefined} alt={service.title} className="max-h-96 w-full object-cover" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-[#F2D9DC]/50 text-sm text-[#351018]/50">No image</div>
        )}
        <div className="space-y-5 p-6 sm:p-8">
          <p className="text-sm text-[#351018]/60">{service.category} · {service.active ? 'Active' : 'Inactive'}</p>
          <h1 className="text-3xl font-semibold text-[#351018]">{service.title}</h1>
          <p className="flex items-center gap-2 text-[#351018]/70"><MapPin size={18} /> {service.city}</p>
          <p className="text-2xl font-semibold text-[#351018]">{Number(service.price).toLocaleString()} AMD</p>
          <p className="whitespace-pre-line text-[#351018]/70">{service.description || 'No description provided.'}</p>
          {service.images.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {service.images.slice(1).map((image, index) => (
                <img key={`${image}-${index}`} src={serviceImage(image) || ''} alt={`${service.title} ${index + 2}`} className="h-28 w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
          <Link to={`/provider/services/${service.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]">
            <Pencil size={17} /> Edit Service
          </Link>
        </div>
      </article>
    </div>
  );
}