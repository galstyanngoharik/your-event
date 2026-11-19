import InvitationEnvelopeSelector from './InvitationEnvelopeSelector';
import InvitationPhotoUpload from './InvitationPhotoUpload';
import type { InvitationEnvelopeId } from '../invitationEnvelopes';
import InvitationBackgroundSelector from './InvitationBackgroundSelector';
import type { InvitationBackgroundTemplate } from '../invitationBackgrounds';
import InvitationPreview from './InvitationPreview';
import { useEffect, useState } from 'react';
import { Copy, Eye, Send } from 'lucide-react';
import type { Event } from '../eventsApi';
import {
  useSaveInvitationMutation,
  useUploadInvitationImageMutation,
} from '../invitationsApi';
import type {
  InvitationBackground,
  InvitationHeadingStyle,
  InvitationTemplate,
  InvitationTextColor,
  InvitationTheme,
} from '../invitationsApi';

interface Props {
  eventId: number;
  event: Event;
}

const templateDefaults: Record<InvitationTemplate, { background: InvitationBackground; text: InvitationTextColor }> = {
  romantic: { background: 'dustyRose', text: 'burgundy' },
  classic: { background: 'cream', text: 'burgundy' },
  modern: { background: 'burgundy', text: 'white' },
};

const templateLabels: Record<InvitationTemplate, string> = {
  romantic: 'Dusty Rose',
  classic: 'Cream',
  modern: 'Burgundy',
};

export default function InvitationBuilder({ eventId, event }: Props) {
  const saved = event.invitation;
  const [envelope, setEnvelope] = useState<InvitationEnvelopeId>(saved?.envelope || 'invitation1');
  const [backgroundTemplate, setBackgroundTemplate] = useState<InvitationBackgroundTemplate | null>(saved?.backgroundTemplate || null);
  const [template, setTemplate] = useState<InvitationTemplate>(saved?.template || (saved?.theme === 'soft' ? 'romantic' : 'classic'));
  const [backgroundColor, setBackgroundColor] = useState<InvitationBackground>(saved?.backgroundColor || (saved?.theme === 'soft' ? 'blush' : 'cream'));
  const [textColor, setTextColor] = useState<InvitationTextColor>(saved?.textColor || 'burgundy');
  const [headingStyle, setHeadingStyle] = useState<InvitationHeadingStyle>(saved?.headingStyle || 'serif');
  const [title, setTitle] = useState(saved?.title || '');
  const [message, setMessage] = useState(saved?.message || '');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(saved?.backgroundImage || null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [published, setPublished] = useState(saved?.published || false);
  const [invitationUrl, setInvitationUrl] = useState(saved?.published && saved.token ? `${window.location.origin}/invite/${saved.token}` : '');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveInvitation, { isLoading: isSaving }] = useSaveInvitationMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadInvitationImageMutation();

  useEffect(() => {
    if (!saved) return;
    setEnvelope(saved.envelope || 'invitation1');
    setTemplate(saved.template || (saved.theme === 'soft' ? 'romantic' : 'classic'));
    setBackgroundColor(saved.backgroundColor || (saved.theme === 'soft' ? 'blush' : 'cream'));
    setTextColor(saved.textColor || 'burgundy');
    setHeadingStyle(saved.headingStyle || 'serif');
    setTitle(saved.title || '');
    setMessage(saved.message || '');
    setBackgroundImage(saved.backgroundImage || null);
    setBackgroundTemplate(saved.backgroundTemplate || null);
    setPublished(saved.published);
    setInvitationUrl(saved.published && saved.token ? `${window.location.origin}/invite/${saved.token}` : '');
  }, [saved]);

  const handleTemplate = (value: InvitationTemplate) => {
    setTemplate(value);
    setBackgroundColor(templateDefaults[value].background);
    setTextColor(templateDefaults[value].text);
  };

  const handleBackgroundColor = (value: InvitationBackground) => {
    setBackgroundColor(value);
    if (value === 'burgundy') setTextColor('white');
    else if (textColor === 'white') setTextColor('burgundy');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setBackgroundFile(file);
    setBackgroundPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setBackgroundImage(null);
    setBackgroundFile(null);
    if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
    setBackgroundPreview(null);
  };

  const handleSave = async () => {
    setError('');
    setNotice('');
    try {
      let imageUrl = backgroundImage;
      if (backgroundFile) {
        const formData = new FormData();
        formData.append('image', backgroundFile);
        imageUrl = (await uploadImage(formData).unwrap()).url;
      }
      const invitation = await saveInvitation({
        eventId,
        theme: (template === 'romantic' ? 'soft' : 'classic') as InvitationTheme,
        template,
        backgroundColor,
        textColor,
        headingStyle,
        title: title.trim(),
        message: message.trim(),
        published,
        backgroundImage: imageUrl,
        backgroundTemplate,
        envelope,
      }).unwrap();
      setBackgroundImage(invitation.backgroundImage);
      setBackgroundFile(null);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      setBackgroundPreview(null);
      setInvitationUrl(invitation.published && invitation.token ? `${window.location.origin}/invite/${invitation.token}` : '');
      setNotice('Invitation design saved.');
    } catch {
      setError('Could not save your invitation design. Please try again.');
    }
  };

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setNotice('Invitation link copied.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy the invitation link.');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-[#351018]">Design Your Invitation</h2>
        <p className="mt-1 text-sm text-[#351018]/60">Create a beautiful invitation that reflects your celebration.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
            <div>
              <h3 className="font-semibold text-[#351018]">Template</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.keys(templateLabels) as InvitationTemplate[]).map((value) => (
                  <button key={value} type="button" onClick={() => handleTemplate(value)} aria-pressed={template === value} className={`rounded-xl border px-3 py-3 text-sm transition ${template === value ? 'border-[#351018] bg-[#F2D9DC]/50 text-[#351018]' : 'border-[#351018]/15 text-[#351018]/70 hover:border-[#D9A3AA]'}`}>
                    {templateLabels[value]}
                  </button>
                ))}
              </div>
            </div>

            <InvitationBackgroundSelector value={backgroundTemplate} onChange={setBackgroundTemplate} />
            <InvitationEnvelopeSelector value={envelope} onChange={setEnvelope} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-base font-semibold text-[#351018]">
                Background
                <select value={backgroundColor} onChange={(event) => handleBackgroundColor(event.target.value as InvitationBackground)} className="w-full rounded-xl border border-[#351018]/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]">
                  <option value="dustyRose">Dusty rose</option><option value="cream">Warm cream</option><option value="blush">Blush pink</option><option value="white">White</option><option value="burgundy">Burgundy</option>
                </select>
              </label>
              <label className="space-y-2 text-base font-semibold text-[#351018]">
                Text color
                <select value={textColor} onChange={(event) => setTextColor(event.target.value as InvitationTextColor)} className="w-full rounded-xl border border-[#351018]/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]">
                  <option value="burgundy">Burgundy</option><option value="dustyRose">Dusty rose</option><option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2 text-base font-semibold text-[#351018]">
              Heading style
              <select value={headingStyle} onChange={(event) => setHeadingStyle(event.target.value as InvitationHeadingStyle)} className="w-full rounded-xl border border-[#351018]/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]">
                <option value="serif">Elegant serif</option><option value="sans">Modern sans</option>
              </select>
            </label>

            <label className="block space-y-2 text-base font-semibold text-[#351018]">
              Invitation title
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder={event.title} className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
            </label>

            <label className="block space-y-2 text-base font-semibold text-[#351018]">
              Invitation message
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1500} rows={4} placeholder="Write a warm message for your guests..." className="w-full resize-y rounded-xl border border-[#351018]/15 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
            </label>

            <InvitationPhotoUpload fileName={backgroundFile?.name} hasImage={Boolean(backgroundPreview || backgroundImage)}
              onChange={handleImageChange} onRemove={removePhoto} />

            <label className="flex items-center gap-3 text-sm text-[#351018]">
              <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4 accent-[#351018]" />
              Publish invitation
            </label>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {notice && <p role="status" className="text-sm text-[#351018]">{notice}</p>}

            <div className="flex flex-wrap gap-3 border-t border-[#D9A3AA]/30 pt-4">
              <button type="button" onClick={handleSave} disabled={isSaving || isUploading} className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018] disabled:opacity-50">
                <Send size={16} /> {isSaving || isUploading ? 'Saving...' : 'Save Design'}
              </button>
              <button type="button" onClick={() => window.open(invitationUrl, '_blank', 'noopener,noreferrer')} disabled={!invitationUrl} className="inline-flex items-center gap-2 rounded-xl border border-[#351018]/20 px-4 py-3 text-sm text-[#351018] disabled:opacity-40">
                <Eye size={16} /> Public Preview
              </button>
              <button type="button" onClick={handleCopy} disabled={!invitationUrl} className="inline-flex items-center gap-2 rounded-xl border border-[#351018]/20 px-4 py-3 text-sm text-[#351018] disabled:opacity-40">
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            {!invitationUrl && <p className="text-xs text-[#351018]/50">Save and publish your invitation to enable its public link.</p>}
          </section>
        </div>

        <InvitationPreview event={event} template={template} backgroundColor={backgroundColor}
          textColor={textColor} headingStyle={headingStyle} title={title} message={message}
          backgroundImage={backgroundImage} backgroundPreview={backgroundPreview} backgroundTemplate={backgroundTemplate} />
      </div>
    </div>
  );
}
