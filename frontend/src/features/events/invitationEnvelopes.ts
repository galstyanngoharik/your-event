export const invitationEnvelopes = [
  { id: 'invitation1', label: 'Burgundy Envelope', image: '/images/invitation1.png', viewBox: '260 104 1270 710' },
  { id: 'invitation2', label: 'Dusty Rose Envelope', image: '/images/invitation2.png', viewBox: '260 104 1270 710' },
  { id: 'invitation3', label: 'Cream Envelope', image: '/images/invitation3.png', viewBox: '224 116 1260 696' },
] as const;

export type InvitationEnvelopeId = typeof invitationEnvelopes[number]['id'];
