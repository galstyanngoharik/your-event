import type { ChangeEvent } from 'react';
import { Camera, Trash2, UserRound } from 'lucide-react';
import { serviceImage } from '../services/servicesApi';

interface Props {
  avatar: string | null;
  displayName?: string;
  isUploading: boolean;
  isSaving: boolean;
  handleAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setAvatar: (avatar: string | null) => void;
}

export default function ProviderProfileAvatar({ avatar, displayName, isUploading, isSaving, handleAvatarChange, setAvatar }: Props) {
  const imageUrl = serviceImage(avatar || undefined);
  return (
      <div className="flex flex-col items-center gap-5 border-b pb-6 sm:flex-row">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl!}
              alt="Provider avatar"
              className="h-28 w-28 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#351018]/10">
              <UserRound size={44} className="text-[#351018]" />
            </div>
          )}

          <label
            htmlFor="provider-avatar"
            className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#351018] text-white"
          >
            <Camera size={17} />
          </label>

          <input
            id="provider-avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={isUploading || isSaving}
            className="hidden"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-[#351018]">
            {displayName}
          </h2>

          <p className="text-sm text-gray-500">
            Service Provider
          </p>

          <p className="text-xs text-gray-400">
            JPG, PNG or WEBP. Maximum 5 MB.
          </p>

          {avatar && (
            <button
              type="button"
              onClick={() => setAvatar(null)}
              className="inline-flex items-center gap-1 text-xs text-red-600"
            >
              <Trash2 size={14} />
              Remove photo
            </button>
          )}

          {isUploading && (
            <p className="text-xs text-gray-500">
              Uploading photo...
            </p>
          )}
        </div>
      </div>
  );
}
