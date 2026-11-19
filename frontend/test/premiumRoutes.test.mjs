import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';

// Test-only cache fixtures: no API or database writes.
const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};
let server;
let store;
let api;
let css;
let OrganizerLayout;
let ProviderLayout;
const pages = new Map();
const event = {
  id: 1, title: 'Route verification event', type: 'wedding', description: 'Planning details',
  date: '2030-12-20T18:00:00Z', city: 'Yerevan', address: 'Test address', budget: 100,
  expectedGuests: 10, status: 'planning', coverImage: null,
  tasks: [{ id: 1, completed: true }, { id: 2, completed: false }],
  expenses: [{ id: 1, category: 'Venue', amount: 50 }, { id: 2, category: 'Catering', amount: 30 }], guests: [],
};
const user = { id: 1, name: 'Test user', email: 'test@example.test', role: 'organizer', workingCities: [] };
const service = {
  id: 1, title: 'Route verification service', category: 'venue', city: 'Yerevan',
  price: '100', images: [], providerId: 1, active: true, description: 'Service details', provider: user,
};
const conversation = { id: 1, organizer: user, provider: user, updatedAt: '2026-11-19T12:00:00Z', messages: [] };

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } });
  const router = await readFile(new URL('../src/app/router.tsx', import.meta.url), 'utf8');
  for (const match of router.matchAll(/import (\w+) from '(\.\.\/pages\/[^']+)';/g)) {
    pages.set(match[1], (await server.ssrLoadModule(`/src/${match[2].slice(3)}.tsx`)).default);
  }
  ({ default: OrganizerLayout } = await server.ssrLoadModule('/src/components/layout/OrganizerLayout.tsx'));
  ({ default: ProviderLayout } = await server.ssrLoadModule('/src/components/layout/ProviderLayout.tsx'));
  if (process.env.YOUREVENT_UI_CAPTURE_DIR) {
    const assets = new URL('../dist/assets/', import.meta.url);
    const filename = (await readdir(assets)).find(name => name.endsWith('.css'));
    css = await readFile(new URL(filename, assets), 'utf8');
    await mkdir(process.env.YOUREVENT_UI_CAPTURE_DIR, { recursive: true });
  }
  ({ store } = await server.ssrLoadModule('/src/app/store.ts'));
  ({ api } = await server.ssrLoadModule('/src/services/api.ts'));
  store.dispatch({ type: 'auth/setUser', payload: user });
  const entries = [
    ['getEvents', undefined, [event]], ['getDashboardEvents', undefined, [event]],
    ['getEventById', 1, event], ['getTasks', 1, []], ['getExpenses', 1, []], ['getGuests', 1, []],
    ['getMe', undefined, user], ['getMyServices', undefined, [service]], ['getService', 1, service],
    ['getConversations', undefined, [conversation]], ['getMessages', 1, [
      { id: 1, conversationId: 1, senderId: 2, body: 'Shall we confirm the event details?', createdAt: '2026-11-19T12:00:00Z' },
      { id: 2, conversationId: 1, senderId: 1, body: 'Yes, everything is ready. Thank you!', createdAt: '2026-11-19T12:01:00Z' },
    ]],
    ['getFavorites', undefined, [{ id: 1, serviceId: 1, Service: service }]],
    ['getProvider', 1, user], ['getProviderPortfolio', 1, []],
    ['getProviderReviews', 1, { averageRating: 0, reviewCount: 0, reviews: [] }],
    ['getMyProviderReview', 1, null], ['getMoodboard', 1, { items: [], colors: [], layout: {} }],
    ['getServices', { search: '', city: '', category: '', maxPrice: '', sort: 'newest', offset: 0 }, { rows: [service], count: 1 }],
  ];
  store.dispatch(api.util.upsertQueryEntries(entries.map(([endpointName, arg, value]) => ({ endpointName, arg, value }))));
});

after(async () => {
  store?.dispatch(api.util.resetApiState());
  await server?.close();
  delete globalThis.localStorage;
});

const cases = [
  ['LandingPage', '/', '/'], ['LoginPage', '/login', '/login'], ['RegisterPage', '/register', '/register'],
  ['PublicInvitationPage', '/invite/:token', '/invite/test'],
  ['OrganizerDashboard', '/organizer', '/organizer'], ['MyEventsPage', '/organizer/events', '/organizer/events'],
  ['CreateEventPage', '/organizer/events/new', '/organizer/events/new'],
  ['EditEventPage', '/organizer/events/:id/edit', '/organizer/events/1/edit'],
  ['EventDetailsPage', '/organizer/events/:id', '/organizer/events/1'],
  ['EventMoodboardPage', '/organizer/events/:eventId/moodboard', '/organizer/events/1/moodboard'],
  ['OrganizerProfilePage', '/organizer/profile', '/organizer/profile'],
  ['FavoritesPage', '/organizer/favorites', '/organizer/favorites'],
  ['ServicesPage', '/organizer/services', '/organizer/services'],
  ['ServiceDetailsPage', '/organizer/services/:id', '/organizer/services/1'],
  ['ProviderProfilePage', '/organizer/providers/:id', '/organizer/providers/1'],
  ['MessagesPage', '/organizer/messages', '/organizer/messages?chat=1'],
  ['ProviderDashboard', '/provider', '/provider'],
  ['ProviderServicesPage', '/provider/services', '/provider/services'],
  ['ProviderServiceFormPage', '/provider/services/new', '/provider/services/new'],
  ['ProviderServiceFormPage', '/provider/services/:id/edit', '/provider/services/1/edit'],
  ['ProviderServiceDetailsPage', '/provider/services/:id', '/provider/services/1'],
  ['ProviderProfileEditPage', '/provider/profile', '/provider/profile'],
  ['ProviderPortfolioPage', '/provider/portfolio', '/provider/portfolio'],
  ['MessagesPage', '/provider/messages', '/provider/messages?chat=1'],
];

for (const [name, path, location] of cases) {
  test(`existing route renders: ${location}`, async () => {
    store.dispatch({ type: 'auth/setUser', payload: { ...user, role: path.startsWith('/provider') ? 'provider' : 'organizer' } });
    const html = renderToStaticMarkup(h(Provider, { store }, h(MemoryRouter, { initialEntries: [location] },
      h(Routes, null, h(Route, { path, element: h(pages.get(name)) })))));
    assert.ok(html.length > 20);
    if (name === 'MyEventsPage') {
      assert.match(html, /ye-event-card/);
      assert.match(html, /Route verification event/);
      assert.match(html, /\/organizer\/events\/1/);
    }
    if (name === 'EventDetailsPage') {
      assert.match(html, /ye-event-header/);
      for (const tab of ['Overview', 'Tasks', 'Budget', 'Guests', 'Invitation', 'Moodboard', 'Timeline']) assert.ok(html.includes(tab));
    }
    if (name === 'MessagesPage') assert.match(html, /ye-composer/);
    if (name === 'ServicesPage') assert.match(html, /Route verification service/);
    if (process.env.YOUREVENT_UI_CAPTURE_DIR) {
      const layout = path.startsWith('/organizer') ? OrganizerLayout : path.startsWith('/provider') ? ProviderLayout : null;
      const route = h(Route, { path, element: h(pages.get(name)) });
      const content = renderToStaticMarkup(h(Provider, { store }, h(MemoryRouter, { initialEntries: [location] },
        h(Routes, null, layout ? h(Route, { element: h(layout) }, route) : route))));
      for (const theme of ['light', 'dark']) {
        const document = `<!doctype html><html data-theme="${theme}" data-theme-scope="${name === 'PublicInvitationPage' ? 'public' : 'app'}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${content}<script>
          addEventListener('load', () => {
            document.body.dataset.horizontalOverflow = String(document.documentElement.scrollWidth > innerWidth);
            document.body.dataset.contentOverflow = String([...document.querySelectorAll('main')].some(main => main.scrollWidth > main.clientWidth));
          });
        </script></body></html>`;
        await writeFile(join(process.env.YOUREVENT_UI_CAPTURE_DIR, `${name}-${name === 'MessagesPage' && path.startsWith('/provider') ? 'provider-' : ''}${path.endsWith('/edit') ? 'edit-' : ''}${theme}.html`), document);
      }
    }
  });
}

test('every page imported by the existing router is covered', () => {
  assert.deepEqual(new Set(pages.keys()), new Set(cases.map(([name]) => name)));
});
