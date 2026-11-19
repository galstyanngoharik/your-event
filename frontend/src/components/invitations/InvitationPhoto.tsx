import { serviceImage } from '../../features/services/servicesApi';

export default function InvitationPhoto({ imageUrl, previewUrl, background = false }: {
  imageUrl: string | null;
  previewUrl?: string | null;
  background?: boolean;
}) {
  const source = previewUrl || serviceImage(imageUrl || undefined);
  if (!source) return null;

  return <img src={source} alt="Selected invitation photo" className={background ? 'pointer-events-none absolute inset-0 h-full w-full object-cover' : 'block h-auto w-full object-contain'} />;
}
