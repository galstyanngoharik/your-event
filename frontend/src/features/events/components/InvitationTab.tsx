import { useState } from 'react';
import { Copy, Send, Check } from 'lucide-react';
import {
  useSaveInvitationMutation,
  useUploadInvitationImageMutation,
} from '../invitationsApi';
import type { InvitationTheme } from '../invitationsApi';
import { Share2 } from 'lucide-react';
interface Props {
  eventId: number;
}

export default function InvitationTab({ eventId }: Props) {
  const [theme, setTheme] = useState<InvitationTheme>('classic');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [published, setPublished] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveInvitation] = useSaveInvitationMutation();
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [uploadInvitationImage] = useUploadInvitationImageMutation();

const handleBackgroundChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('Please select a JPG, PNG or WebP image.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be smaller than 5 MB.');
    return;
  }

  setBackgroundFile(file);
  setBackgroundPreview(URL.createObjectURL(file));
};
  const handleSave = async () => {
    try {
    const formData = new FormData();
    if (backgroundFile) formData.append('image', backgroundFile);
    const uploadedBackground = backgroundFile
      ? await uploadInvitationImage(formData).unwrap()
      : null;

    const invitation = await saveInvitation({
      eventId,
      theme,
      title: title.trim(),
      message: message.trim(),
      published,
      backgroundImage: uploadedBackground?.url ?? null,
    }).unwrap();

    if (invitation.published && invitation.token) {
      setInvitationUrl(
        `${window.location.origin}/invite/${invitation.token}`
      );
    } else {
      setInvitationUrl('');
    }
  } catch (err) {
    console.log(err);
  }
   
  };

  const handleCopy = async () => {
  if (!invitationUrl) return;

  try {
    await navigator.clipboard.writeText(invitationUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
};
  const handleShare = async () => {
  if (!invitationUrl) return;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Event Invitation',
        text: 'You are invited to my event!',
        url: invitationUrl,
      });
    } else {
      await navigator.clipboard.writeText(invitationUrl);
      alert('Link copied! You can share it now.');
    }
  } catch (err) {
    console.error('Share error:', err);
  }
};

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[#351018]">
          Event Invitation
        </h2>

        <p className="mt-2 text-sm text-[#351018]/60">
          Create a beautiful invitation for your guests.
        </p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-[#351018]">
          Invitation Style
        </label>

        <div className="grid gap-4 sm:grid-cols-4">
          {(['classic', 'soft', 'dark'] as InvitationTheme[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setTheme(item);
                  setBackgroundFile(null);
                  setBackgroundPreview(null);
                }}
                className={`rounded-xl border-2 p-5 text-left transition ${
                  theme === item
                    ? 'border-[#351018]'
                    : 'border-[#351018]/10'
                }`}
              >
                <div
                  className={`mb-4 h-20 rounded-lg ${
                    item === 'classic'
                      ? 'bg-[#F4E8DC]'
                      : item === 'soft'
                        ? 'bg-[#F7DDE5]'
                        : 'bg-[#351018]'
                  }`}
                />

                <span className="text-sm font-medium capitalize text-[#351018]">
                  {item}
                </span>
              </button>
            )
          )}
          <label
            className={`cursor-pointer rounded-xl border-2 p-5 text-left transition ${
              backgroundFile
                ? 'border-[#351018]'
                : 'border-[#351018]/10'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBackgroundChange}
              className="sr-only"
            />
            <div
              className="mb-4 flex h-20 items-center justify-center rounded-lg bg-[#F4E8DC] bg-cover bg-center text-sm text-[#351018]"
              style={backgroundPreview ? { backgroundImage: `url(${backgroundPreview})` } : undefined}
            >
              {!backgroundPreview && 'Choose photo'}
            </div>
            <span className="text-sm font-medium text-[#351018]">
              Custom photo
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {backgroundPreview && (
          <div className="space-y-3">
            <img
              src={backgroundPreview}
              alt="Invitation background preview"
              className="h-48 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setBackgroundFile(null);
                setBackgroundPreview(null);
              }}
              className="text-sm text-red-600"
            >
              Remove Photo
            </button>
          </div>
        )}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Invitation title"
          className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message for your guests..."
          className="min-h-32 w-full rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-[#351018]">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-[#351018]"
        />
        Publish invitation
      </label>
      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-[#351018] px-6 py-3 text-sm text-white"
      >
        <Send size={17} />
        Save Invitation
      </button>

      {invitationUrl && (
        <div className="rounded-xl border border-[#351018]/10 p-5">
          <p className="mb-3 text-sm font-medium text-[#351018]">
            Public Invitation Link
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <input
              readOnly
              value={invitationUrl}
              className="min-w-0 flex-1 rounded-lg border border-[#351018]/10 p-3 text-sm"
            />

            <button
            type="button"
            onClick={handleCopy}
            disabled={!invitationUrl}
            className="flex items-center justify-center gap-1 rounded-xl border border-[#351018]/20 px-5 py-3 text-sm font-medium text-[#351018] disabled:opacity-50"
            >
            {copied ? (
                <>
                <Check size={18} className="text-green-600" />
                <span className="text-green-600">Copied!</span>
                </>
            ) : (
                <>
                <Copy size={15} />
                Copy
                </>
            )}
            </button>
            <button
            type="button"
            onClick={handleShare}
            disabled={!invitationUrl}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#351018] px-3 py-3 text-sm text-white disabled:opacity-50"
            >
            <Share2 size={12} />
            Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}