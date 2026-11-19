import InvitationTemplateBackground from '../../../components/invitations/InvitationTemplateBackground';
import type { InvitationBackgroundTemplate } from '../invitationBackgrounds';
import InvitationPhoto from '../../../components/invitations/InvitationPhoto';
import type { Event } from '../eventsApi';
import type {
  InvitationBackground, InvitationHeadingStyle, InvitationTemplate, InvitationTextColor,
} from '../invitationsApi';

interface Props {
  event: Event;
  template: InvitationTemplate;
  backgroundColor: InvitationBackground;
  textColor: InvitationTextColor;
  headingStyle: InvitationHeadingStyle;
  title: string;
  message: string;
  backgroundImage: string | null;
  backgroundPreview: string | null;
  backgroundTemplate?: InvitationBackgroundTemplate | null;
}

const backgroundClasses: Record<InvitationBackground, string> = {
  cream: 'bg-[#FFF8F1]',
  dustyRose: 'bg-[#D9A3AA]',
  blush: 'bg-[#F2D9DC]',
  white: 'bg-white',
  burgundy: 'bg-[#351018]',
};

const textClasses: Record<InvitationTextColor, string> = {
  burgundy: 'text-[#351018]',
  white: 'text-white',
  dustyRose: 'text-[#A96D79]',
  black: 'text-black',
};

export default function InvitationPreview({ event, template, backgroundColor, textColor,
  headingStyle, title, message, backgroundImage, backgroundPreview, backgroundTemplate }: Props) {
  const previewSurface = backgroundClasses[backgroundColor];
  const previewText = textClasses[textColor];
  const headingFont = headingStyle === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <section className="space-y-3 lg:sticky lg:top-6">
      <h3 className="text-sm font-semibold text-[#351018]">Live Preview</h3>
      <div data-theme-preserve className={`relative isolate min-h-[520px] overflow-hidden rounded-3xl border shadow-sm ${template === 'romantic' ? 'border-[#D9A3AA]/70' : template === 'classic' ? 'border-[#D9A3AA]/40' : 'border-[#351018]/10'} ${previewSurface}`}>
        {backgroundTemplate && !backgroundPreview && !backgroundImage && <InvitationTemplateBackground template={backgroundTemplate} />}
        <InvitationPhoto imageUrl={backgroundImage} previewUrl={backgroundPreview} background />
        <div className={`relative p-7 sm:p-10 ${backgroundPreview || backgroundImage || backgroundTemplate ? 'bg-white/70' : ''}`}>
          <div className={`mx-auto flex min-h-[450px] max-w-lg flex-col items-center justify-center text-center ${previewText}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-60">You're Invited</p>
            <div className="my-6 h-px w-16 bg-[#D9A3AA]" />
            <h2 className={`text-3xl font-semibold sm:text-4xl ${headingFont}`}>{title.trim() || event.title}</h2>
            <p className="mt-5 max-w-sm whitespace-pre-line text-sm leading-7 opacity-80">{message.trim() || 'Join us for a special celebration.'}</p>
            <div className="my-8 h-px w-full bg-[#351018]/15" />
            <p className="text-sm font-medium">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
            <p className="mt-2 text-sm opacity-75">{[event.city, event.address].filter(Boolean).join(', ')}</p>
            <p className="mt-8 text-xs uppercase tracking-[0.2em] opacity-50">YourEvent</p>
          </div>
        </div>
      </div>
    </section>
  );
}
