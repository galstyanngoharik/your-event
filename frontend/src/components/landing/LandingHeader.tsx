import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ThemeToggle from '../../features/theme/ThemeToggle';

export default function LandingHeader() {
  return (
    <header className="ye-landing-header sticky top-0 z-40 border-b border-[#351018]/10 bg-[#D9A3AA]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="-ml-3 inline-flex items-center gap-2 font-serif text-3xl font-bold">
          <Heart size={28} fill="none" aria-hidden="true" className="shrink-0 text-[#351018]" />
          YourEvent
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#about" className="transition-colors hover:text-[#B77886]">
            About
          </a>
          <a href="#features" className="transition-colors hover:text-[#B77886]">
            Features
          </a>
          <a href="#roles" className="transition-colors hover:text-[#B77886]">
            Who It's For
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[#351018] px-5 py-2 text-sm transition-all duration-300 hover:bg-[#351018] hover:text-white"
          >
            Log In
          </Link>

          <Link
            to="/register"
            className="hidden rounded-full bg-[#351018] px-5 py-2 text-sm text-white transition-all duration-300 hover:scale-105 hover:bg-[#57202C] sm:block"
          >
            Sign Up
          </Link>
          <ThemeToggle label="" compact />
        </div>
      </nav>
    </header>
  );
}
