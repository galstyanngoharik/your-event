import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/organizer': 'Dashboard',
  '/organizer/events': 'My Events',
  '/organizer/saved': 'Saved Services',
  '/organizer/messages': 'Messages',
  '/organizer/profile': 'My Profile',
  '/provider': 'Dashboard',
  '/provider/services': 'My Services',
  '/provider/services/new': 'Add New Service',
  '/provider/profile': 'My Profile',
  '/provider/portfolio': 'My Works',
  '/provider/messages': 'Messages',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const title = pageTitles[pathname]
    ?? (pathname.startsWith('/provider/services/')
      ? pathname.endsWith('/edit') ? 'Edit Service' : 'Service Details'
      : 'Event Details');
  const displayName = user?.role === 'provider'
    ? user.businessName || user.name
    : user?.name;
  const initial = displayName?.charAt(0).toUpperCase() ?? 'U';
  const avatarUrl = user?.avatar
    ? /^https?:\/\//i.test(user.avatar)
      ? user.avatar
      : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '')}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`
    : null;
  const subtitle = pathname === '/provider'
    ? 'Manage your services and connect with clients.'
    : 'Plan your perfect moments';

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#D9A3AA]/50 bg-[#FFFDFB] px-5 md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-[#351018] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-[#351018] md:text-2xl">
            {title}
          </h1>

          <p className="hidden text-xs text-[#351018]/50 sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div
          className="hidden text-right sm:block"
        >
          <p className="text-sm font-semibold text-[#351018]">
            {displayName}
          </p>

          <p className="text-xs capitalize text-[#351018]/50">
            {user?.role}
          </p>
        </div>

        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-10 w-10 rounded-full border border-[#D9A3AA]/50 object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9A3AA] text-sm font-semibold text-[#351018]">
            {initial}
          </div>
        )}
      </div>
    </header>
  );
}