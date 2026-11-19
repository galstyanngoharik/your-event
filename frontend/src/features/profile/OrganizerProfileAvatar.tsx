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
  setMessage: (message: string) => void;
}

export default function OrganizerProfileAvatar({ avatar, displayName, isUploading, isSaving, handleAvatarChange, setAvatar, setMessage }: Props) {
  const imageUrl = avatar && /^https?:\/\//i.test(avatar) ? avatar : serviceImage(avatar || undefined);
  return (
    <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl!}
            alt="Profile avatar"
            className="h-28 w-28 rounded-full border-4 border-[#351018]/10 object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#351018]/10">
            <UserRound size={44} className="text-[#351018]" />
          </div>
        )}

        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#351018] text-white shadow"
        >
          <Camera size={17} />
        </label>

        <input
          id="avatar-upload"
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
          Organizer
        </p>

        <p className="text-xs text-gray-400">
          JPG, PNG or WEBP. Maximum 5 MB.
        </p>

        {avatar && (
          <button
            type="button"
            onClick={() => {
              setAvatar(null);
              setMessage('Click Save Changes to remove your avatar.');
            }}
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
