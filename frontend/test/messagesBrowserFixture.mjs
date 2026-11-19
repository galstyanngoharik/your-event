// Isolated HTTP fixtures for browser tests. No requests reach the real API.
export const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN7kAAAAASUVORK5CYII=';
export function messagingFixture(role) {
  const user = { id: 1, name: 'Test account', email: 'test@example.test', role };
  const partners = [{ id: 2, name: 'Ani', businessName: 'Ani Studio' }, { id: 3, name: 'Alex' }];
  const messages = new Map([[1, [
    { id: 1, conversationId: 1, senderId: 2, body: 'Let us confirm your event details.', createdAt: '2026-11-19T12:00:00Z' },
    ...Array.from({ length: 16 }, (_, index) => ({
      id: 100 + index, conversationId: 1, senderId: 2,
      body: `Planning note ${index + 1}: ${index === 0 ? 'a'.repeat(300) : 'Please confirm the event arrangements.'}`,
      createdAt: '2026-11-19T12:00:30Z',
    })),
    { id: 2, conversationId: 1, senderId: 1, body: 'The venue is ready.', createdAt: '2026-11-19T12:01:00Z' },
  ]], [2, [{ id: 3, conversationId: 2, senderId: 3, body: 'Welcome to the second conversation.', createdAt: '2026-11-19T12:00:00Z' }]]]);
  let nextId = 4;
  const operations = [];
  const respond = request => {
    const path = new URL(request.url).pathname.replace(/^\/api/, '');
    const method = request.method;
    if (method === 'OPTIONS') return { data: {} };
    if (path === '/auth/login') return { data: { token: 'test-token', user } };
    if (path === '/events' || path === '/services/mine') return { data: [] };
    if (path.endsWith('/reviews')) return { data: { averageRating: 0, reviewCount: 0, reviews: [] } };
    if (path === '/auth/me') return { data: user };
    if (path.startsWith('/notifications')) return { data: { notifications: [], unreadCount: 0, total: 0 } };
    if (path === '/conversations') return { data: partners.map((partner, index) => ({
      id: index + 1, organizerId: role === 'organizer' ? 1 : partner.id,
      providerId: role === 'provider' ? 1 : partner.id,
      organizer: role === 'organizer' ? user : partner, provider: role === 'provider' ? user : partner,
      updatedAt: '2026-11-19T12:01:00Z', messages: messages.get(index + 1).slice(-1),
    })) };
    if (path.endsWith('/attachment')) return { raw: png, mime: 'image/png' };
    const match = path.match(/^\/conversations\/(\d+)\/messages(?:\/(\d+))?$/);
    if (!match) throw new Error(`Unexpected fixture request: ${method} ${path}`);
    const list = messages.get(Number(match[1]));
    if (method === 'GET') return { data: list };
    operations.push(method);
    if (method === 'POST') {
      const multipart = Object.entries(request.headers).some(([key, value]) => key.toLowerCase() === 'content-type' && value.includes('multipart'));
      const body = multipart ? '' : JSON.parse(request.postData || '{}').body;
      const message = { id: nextId++, conversationId: Number(match[1]), senderId: 1, body, createdAt: new Date().toISOString() };
      if (multipart) message.attachment = {
        type: 'image', name: 'test.png', mime: 'image/png', size: 68,
        url: `/conversations/${match[1]}/messages/${message.id}/attachment`,
      };
      list.push(message);
      return { data: message };
    }
    const message = list.find(item => item.id === Number(match[2]));
    if (method === 'PATCH') Object.assign(message, { body: JSON.parse(request.postData).body, editedAt: new Date().toISOString() });
    if (method === 'DELETE') Object.assign(message, { body: '', attachment: null, deletedAt: new Date().toISOString() });
    return { data: message };
  };
  return { respond, operations };
}
