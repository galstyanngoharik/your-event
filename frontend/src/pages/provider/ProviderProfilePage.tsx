import ProviderContactFields from '../../features/profile/ProviderContactFields';
import ProviderProfileAvatar from '../../features/profile/ProviderProfileAvatar';
import ThemeToggle from '../../features/theme/ThemeToggle';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { setUser } from '../../features/auth/authSlice';
import { useGetMeQuery } from '../../features/auth/authApi';
import {
  useUpdateProviderProfileMutation,
  useUploadProviderAvatarMutation,
} from '../../features/profile/providersApi';
import PortfolioManager from '../../features/profile/PortfolioManager';

export default function ProviderProfilePage() {
  const dispatch = useAppDispatch();
  const { data: user, isLoading, isError, refetch } =
    useGetMeQuery();

  const [updateProfile, { isLoading: isSaving }] =
    useUpdateProviderProfileMutation();

  const [uploadAvatar, { isLoading: isUploading }] =
    useUploadProviderAvatarMutation();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [cities, setCities] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setBusinessName(user.businessName || '');
    setBio(user.bio || '');
    setCities((user.workingCities || []).join(', '));
    setInstagram(user.instagram || '');
    setPhoneNumber(user.phoneNumber || '');
    setAvatar(user.avatar || null);
  }, [user]);

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
      setMessage('Photo uploaded. Click Save Changes to save it.');
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

    const workingCities = [
      ...new Set(
        cities.split(',').map((city) => city.trim()).filter(Boolean)
      ),
    ];

    try {
      const updatedUser = await updateProfile({
        name: name.trim(),
        businessName: businessName.trim() || null,
        bio: bio.trim() || null,
        avatar,
        workingCities,
        instagram: instagram.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
      }).unwrap();
      dispatch(setUser(updatedUser));
      setMessage('Profile updated successfully.');
    } catch {
      setError('Failed to save profile.');
    }
  };

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading profile...</p>;
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-red-600">Failed to load profile.</p>
        <button onClick={() => refetch()} className="mt-3 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#351018]">
            Provider Profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your business information.
          </p>
        </div>
        <ThemeToggle />
      </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 shadow-sm sm:p-8"
        >
        <ProviderProfileAvatar avatar={avatar} displayName={user.name} isUploading={isUploading}
          isSaving={isSaving} handleAvatarChange={handleAvatarChange} setAvatar={setAvatar} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#351018]">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
                  className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#351018]">
              Email
            </label>
            <input
              value={user.email}
              disabled
              className="w-full rounded-xl border border-[#351018]/10 bg-[#FFF8F1] px-4 py-3 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#351018]">
              Business Name
            </label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              maxLength={120}
              placeholder="Your business name"
              className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#351018]">
              Working Cities
            </label>
            <input
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="New York"
              className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
            />
            <p className="text-xs text-gray-400">
              Separate cities with commas.
            </p>
          </div>

          <ProviderContactFields instagram={instagram} phoneNumber={phoneNumber}
            setInstagram={setInstagram} setPhoneNumber={setPhoneNumber} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#351018]">
              About Business
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Tell organizers about your services..."
              className="w-full resize-none rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <div className="flex justify-end border-t pt-5">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-6 py-3 text-sm text-white transition hover:bg-[#D9A3AA] hover:text-[#351018] disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <PortfolioManager providerId={user.id} />
    </div>
  );
}
