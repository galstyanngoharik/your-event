import { invitationEnvelopes } from '../../features/events/invitationEnvelopes';
import type { InvitationEnvelopeId } from '../../features/events/invitationEnvelopes';

export default function InvitationEnvelopeImage({ envelope, className = 'block h-full w-full' }: {
  envelope?: InvitationEnvelopeId | null;
  className?: string;
}) {
  const selected = invitationEnvelopes.find(({ id }) => id === envelope) || invitationEnvelopes[0];

  return (
    <svg viewBox={selected.viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label={selected.label} className={className}>
      <image href={selected.image} width={1672} height={941} />
    </svg>
  );
}
