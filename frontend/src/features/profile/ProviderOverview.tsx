import { Camera, MapPin, Phone, UserRound } from 'lucide-react';
import type { ProviderProfile } from './providersApi';
import { serviceImage } from '../services/servicesApi';

export default function ProviderOverview({ provider }: { provider: ProviderProfile }) {
  return (
    <section className="rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {provider.avatar ? (
          <img
            src={serviceImage(provider.avatar) || ''}
            alt={provider.name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#351018]/10">
            <UserRound size={38} className="text-[#351018]" />
          </div>
        )}

        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-semibold text-[#351018]">
            {provider.businessName || provider.name}
          </h1>

          {provider.businessName && (
            <p className="text-sm text-gray-500">
              {provider.name}
            </p>
          )}

          {provider.workingCities?.length > 0 && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={17} />
              {provider.workingCities.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-[#D9A3AA]/30 pt-6">
        <h2 className="text-lg font-semibold text-[#351018]">
          About Provider
        </h2>

        <p className="mt-3 whitespace-pre-line text-[#351018]/70">
          {provider.bio || 'No description provided yet.'}
        </p>
      </div>

      {(provider.instagram || provider.phoneNumber) && (
        <div className="mt-6 flex flex-wrap gap-4 border-t border-[#D9A3AA]/30 pt-5">
          {provider.instagram && (
            <a href={provider.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#351018] hover:text-[#A86F79]">
              <Camera size={18} /> Instagram
            </a>
          )}
          {provider.phoneNumber && (
            <a href={`tel:${provider.phoneNumber.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#351018] hover:text-[#A86F79]">
              <Phone size={18} /> {provider.phoneNumber}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
