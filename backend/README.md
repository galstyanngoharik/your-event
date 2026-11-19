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


### Notifications and event timeline

Restart the API with `npm start` (or the existing `npm run dev`) to create the new
`Notifications` and `TimelineActivities` tables through the existing `db.sync()` startup.
No reset or destructive migration is required.

Notifications are recipient-scoped and persist in PostgreSQL. New messages,
message edits/deletions and public RSVP responses generate notifications from existing actions.
There is no collaboration workflow in this version, so no collaboration notices are generated.
The frontend polls every 15 seconds. Mark-one and mark-all operations invalidate that cache.

Reminders run on startup and every 60 seconds while the backend process is running.
They cover planning events in the next 24 hours and incomplete tasks due today or tomorrow.
Task calendar days use `APP_TIMEZONE`, defaulting to `Asia/Yerevan`.
A unique occurrence key prevents duplicates across polls, restarts and multiple API processes.
While the backend is stopped no reminders are generated; restart catches still-upcoming items.

Notification routes: `GET /api/notifications`, `PATCH /api/notifications/:id/read`,
and `PATCH /api/notifications/read-all`.
Timeline routes: `GET/POST /api/events/:eventId/timeline` and
`PATCH/DELETE /api/events/:eventId/timeline/:activityId`.
Timeline times are local single-day `HH:mm` strings, sorted by start time then ID.
The current event-owner authorization rules apply. End time must be later than start time.
