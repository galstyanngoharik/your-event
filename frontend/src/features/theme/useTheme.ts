import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const storageKey = 'yourevent-theme';
const themeEvent = 'yourevent-theme-change';

const readTheme = (): Theme => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
const subscribe = (notify: () => void) => {
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
    notify();
  };
  window.addEventListener(themeEvent, notify);
  window.addEventListener('storage', syncStorage);
  return () => {
    window.removeEventListener(themeEvent, notify);
    window.removeEventListener('storage', syncStorage);
  };
};

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, (): Theme => 'light');
  const toggleTheme = () => {
    const next: Theme = readTheme() === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch { /* The theme still works when storage is unavailable. */ }
    window.dispatchEvent(new Event(themeEvent));
  };
  return { theme, toggleTheme };
}
