import { Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme';

export default function ThemeToggle({ label, compact = false }: { label?: string; compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const Icon = dark ? Moon : Sun;

  return (
    <button type="button" onClick={toggleTheme} aria-pressed={dark}
      aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex shrink-0 items-center gap-2 border text-sm font-medium text-[#351018] outline-none transition-colors hover:bg-[#F2D9DC]/40 focus-visible:ring-2 focus-visible:ring-[#D9A3AA] ${compact ? 'rounded-full border-[#351018] bg-transparent px-3 py-2' : 'rounded-xl border-[#D9A3AA]/40 bg-white px-4 py-3'}`}>
      <Icon size={19} />
      <span className={compact ? 'hidden sm:inline' : undefined}>{label || (dark ? 'Dark Mode' : 'Light Mode')}</span>
    </button>
  );
}
