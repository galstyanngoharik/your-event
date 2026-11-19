import SaveServiceButton from '../../../features/services/SaveServiceButton';

import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, UserRound } from 'lucide-react';
import {
  useGetServiceQuery,
  serviceImage,
} from '../../../features/services/servicesApi';
import StartConversationButton from '../../../features/messages/StartConversation';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const serviceId = Number(id);

  const { data: service, isLoading, isError, refetch } =
    useGetServiceQuery(serviceId, {
      skip: !Number.isInteger(serviceId) || serviceId <= 0,
    });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/organizer/services"
        className="flex items-center gap-2 text-sm text-[#351018]"
      >
        <ArrowLeft size={18} /> Back to services
      </Link>

      {isLoading ? (
        <p>Loading service...</p>
      ) : isError || !service ? (
        <div className="text-red-600">
          Service not found.
          <button onClick={() => refetch()} className="ml-2 underline">
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {serviceImage(service.images?.[0]) ? (
            <img
              src={serviceImage(service.images[0])!}
              alt={service.title}
              className="max-h-96 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}

          <div className="space-y-5 p-8">
            <p className="text-sm text-gray-500">{service.category}</p>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold text-[#351018]">{service.title}</h1>
              <SaveServiceButton key={service.id} serviceId={service.id} />
            </div>

            <p className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} /> {service.city}
            </p>

            <p className="text-2xl font-semibold text-[#351018]">
              {Number(service.price).toLocaleString()} AMD
            </p>

            <p className="whitespace-pre-line text-gray-600">
              {service.description || 'No description provided.'}
            </p>

            {service.images?.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {service.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={serviceImage(image) || ''}
                    alt={`${service.title} ${index + 2}`}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            {service.provider && (
              <div className="border-t pt-5">
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <UserRound size={18} /> Service Provider
                </p>

                <h2 className="mt-2 font-semibold text-[#351018]">
                  {service.provider.businessName || service.provider.name}
                </h2>
                {service.providerId && (
                  <Link
                    to={`/organizer/providers/${service.providerId}`}
                    className="mt-4 inline-block rounded-xl bg-[#351018] px-5 py-3 text-sm text-white"
                  >
                    View Provider Profile
                  </Link>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  {service.provider.bio}
                </p>
                {service.providerId && (
                  <StartConversationButton providerId={service.providerId} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
