export function applyThemeScope(pathname: string) {
  const appPage = ['/', '/login', '/register'].includes(pathname) || /^\/(organizer|provider)(\/|$)/.test(pathname);
  document.documentElement.dataset.themeScope = appPage ? 'app' : 'public';
}
