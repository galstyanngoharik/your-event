import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import PortfolioManager from '../../features/profile/PortfolioManager';

export default function ProviderPortfolioPage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <p className="text-sm text-[#351018]/60">Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        to="/provider"
        className="inline-flex items-center gap-2 text-sm text-[#351018]"
      >
        <ArrowLeft size={17} /> Back to Dashboard
      </Link>
      <PortfolioManager providerId={user.id} />
    </div>
  );
}