# YourEvent Backend

Express + Sequelize + PostgreSQL REST API with Swagger.

## Requirements
- Node.js 20+
- PostgreSQL 16+

## Setup

```bash
createdb yourevent_db
npm install
cp .env.example .env
```

Edit `.env` and set your real PostgreSQL connection URL, a random `JWT_SECRET` of at least 32 characters, and frontend URL. Then:

```bash
npm run dev
```

Swagger UI: http://localhost:3000/api-docs

Health: http://localhost:3000/api/health

Optional sample data:

```bash
npm run seed
```

Demo accounts (only after seeding):
- organizer@yourevent.test / DemoPass123!
- provider@yourevent.test / DemoPass123!

## Authentication

Register with `POST /api/auth/register`, then login with `POST /api/auth/login`. Paste the JWT in Swagger **Authorize**. Authenticated endpoints require `Authorization: Bearer <token>`.

## Key workflow
1. Organizer creates event (auto-creates template tasks).
2. Organizer manages tasks, expenses, and guests.
3. Organizer publishes invitation with `PUT /api/events/:eventId/invitation` and `published: true`.
4. Guest opens `/api/invitations/:token`, responds via `/api/invitations/:token/rsvp` without an account. Store the returned responseToken to allow that guest to edit their answer.
5. Provider creates service; organizer browses catalog, favorites service, starts conversation, sends messages.
6. Frontend polls messages endpoint every few seconds for chat (no Socket.IO in this version).

## Important MVP limitations
- Uploaded images are stored locally under `uploads/` and served publicly. Use cloud object storage and authenticated media access before production. Upload validates declared MIME type and size, not image bytes.
- Public RSVP uses a secret response token for edits, but an invitation link can be used to create multiple guest responses. Add per-guest invite tokens, CAPTCHA/rate limiting and deduplication before production.
- No payments, email delivery, admin panel, push notifications, Socket.IO, or real bookings.
- `sequelize.sync()` is for local development. Use migrations for production.
- `DATABASE_URL` must point to an existing database.
- Seeded credentials are for local development only.
