import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  MessageCircle,
  UserRound,
  LogOut,
  X,
  Store,
} from 'lucide-react';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { api } from '../../services/api';
import type { Role } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
}

const organizerNavigation = [
  {
    label: 'Dashboard',
    path: '/organizer',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'My Events',
    path: '/organizer/events',
    icon: CalendarDays,
  },
  {
    label: 'Saved Services',
    path: '/organizer/favorites',
    icon: Heart,
  },
  {
    label: 'Messages',
    path: '/organizer/messages',
    icon: MessageCircle,
  },
  {
    label: 'Profile',
    path: '/organizer/profile',
    icon: UserRound,
  },
  {
  label: 'Services Catalog',
  path: '/organizer/services',
  icon: Store,
},
];

const providerNavigation = [
  { label: 'Dashboard', path: '/provider', icon: LayoutDashboard, end: true },
  { label: 'My Services', path: '/provider/services', icon: Store },
  { label: 'Messages', path: '/provider/messages', icon: MessageCircle },
  { label: 'Profile', path: '/provider/profile', icon: UserRound },
];

export default function Sidebar({ isOpen, onClose, role = 'organizer' }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const navigation = role === 'provider' ? providerNavigation : organizerNavigation;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    navigate('/login', { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/15 bg-[#351018] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
          <div className="flex h-20 items-center justify-between px-7">
          <NavLink
            to={role === 'provider' ? '/provider' : '/organizer'}
            onClick={onClose}
            className="text-2xl font-bold tracking-tight text-[#FFF8F1]"
          >
            YourEvent.
          </NavLink>

          <button
            onClick={onClose}
            className="text-[#FFF8F1] lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#D9A3AA] text-[#351018]'
                    : 'text-[#FFF8F1]/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/15 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#FFF8F1]/85 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}