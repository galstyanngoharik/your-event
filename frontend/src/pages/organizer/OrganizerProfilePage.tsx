
import { useEffect, useState } from 'react';
import { Camera, Save, UserRound, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setUser } from '../../features/auth/authSlice';
import { useGetMeQuery } from '../../features/auth/authApi';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '../../features/profile/profileApi';

const avatarUrl = (path: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const base = (
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  ).replace(/\/api\/?$/, '');

  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function OrganizerProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: user, isLoading, isError, refetch } =
    useGetMeQuery();

  const [updateProfile, { isLoading: isSaving }] =
    useUpdateProfileMutation();

  const [uploadAvatar, { isLoading: isUploading }] =
    useUploadAvatarMutation();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    dispatch(setUser(user));
    setName(user.name);
    setBio(user.bio || '');
    setAvatar(user.avatar || null);
  }, [user, dispatch]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setError('');
    setMessage('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const result = await uploadAvatar(formData).unwrap();
      setAvatar(result.url);
      setMessage('Photo uploaded. Click Save Changes to update your profile.');
    } catch {
      setError('Failed to upload photo.');
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        avatar,
      }).unwrap();

      dispatch(setUser(updated));
      setMessage('Profile updated successfully.');
    } catch {
      setError('Failed to save profile.');
    }
  };

  if (isLoading && !currentUser) {
    return <p className="p-6 text-gray-500">Loading profile...</p>;
  }

  if (isError && !user) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-red-600">Failed to load profile.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#351018]">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row">
          <div className="relative">
            {avatarUrl(avatar) ? (
              <img
                src={avatarUrl(avatar)!}
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
              {user?.name || currentUser?.name}
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

        <div className="space-y-2">
          <label
            htmlFor="profile-name"
            className="text-sm font-medium text-[#351018]"
          >
            Full Name
          </label>

          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#351018]"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#351018]">
            Email Address
          </label>

          <input
            type="email"
            value={user?.email || currentUser?.email || ''}
            disabled
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
          />

          <p className="text-xs text-gray-400">
            Email cannot be changed here.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="profile-bio"
            className="text-sm font-medium text-[#351018]"
          >
            About Me
          </label>

          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Tell us a little about yourself..."
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#351018]"
          />

          <p className="text-right text-xs text-gray-400">
            {bio.length}/2000
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={isSaving || isUploading || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={17} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
