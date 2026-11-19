import { backgroundTemplateImage } from '../../features/events/invitationBackgrounds';
import type { InvitationBackgroundTemplate } from '../../features/events/invitationBackgrounds';

export default function InvitationTemplateBackground({ template }: {
  template?: InvitationBackgroundTemplate | null;
}) {
  const image = backgroundTemplateImage(template);
  if (!image) return null;

  return <img src={image} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />;
}
