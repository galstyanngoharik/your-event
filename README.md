# YourEvent

**YourEvent** is a full-stack event planning platform that helps organizers plan and manage events while connecting them with service providers.

The application includes dedicated experiences for **Organizers** and **Providers**, with tools for event management, budgeting, guest invitations, messaging, and service discovery.

## Features

### For Organizers

- Create, view, update, and delete events.
- Manage event tasks and track progress.
- Track expenses and event budgets.
- Manage guest lists and RSVP responses.
- Customize and publish invitations with shareable links.
- Create event moodboards and timelines.
- Browse and filter services, save favorites, and review providers.
- Communicate with providers through in-app messages.
- View dashboard statistics and notifications.

### For Providers

- Manage a provider profile and portfolio.
- Create, edit, and manage service listings.
- Communicate with organizers through in-app messages.
- View provider dashboard information and reviews.

### Interface

- Responsive layouts for desktop and smaller screens.
- Light and dark themes.
- A consistent burgundy, dusty-rose, and cream design system.

## Tech Stack

| Frontend | Backend | Database |
| --- | --- | --- |
| React, TypeScript, Vite | Node.js, Express | PostgreSQL |
| Redux Toolkit, RTK Query | Sequelize ORM | |
| React Router, Tailwind CSS | JWT authentication, Zod validation | |
| React Hook Form, Lucide React | Swagger UI | |

## Project Structure

```text
YourEvent/
├── frontend/           # React + TypeScript application
├── backend/            # Express REST API and database models
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 16 or later

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/your-event.git
cd your-event
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure the backend

Create a PostgreSQL database:

```bash
createdb yourevent_db
```

Install backend dependencies and create a local environment file:

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your own settings:

```env
PORT=3000
DATABASE_URL=postgres://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/yourevent_db
JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
CLIENT_URL=http://localhost:5173
PUBLIC_URL=http://localhost:3000
NODE_ENV=development
```

Use a strong, private JWT secret. Do not commit your `.env` files.

Start the backend:

```bash
npm run dev
```

The API is available at `http://localhost:3000`.

- API health check: `http://localhost:3000/api/health`
- Swagger documentation: `http://localhost:3000/api-docs`

The backend currently uses Sequelize synchronization during startup for local development.

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build locally |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |
| `npm run seed` | Insert optional sample data |

## API Documentation

The backend provides a REST API documented with Swagger UI at `/api-docs`.

Protected endpoints use JWT bearer authentication. Register or log in to obtain a token, then provide it in the `Authorization` header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Development Notes

YourEvent is a diploma project and is intended primarily for local development and demonstration. Some features, including uploads and public RSVP, require additional security and infrastructure work before production deployment. The current implementation does not include payment processing or real-time WebSocket messaging.

## Security

- Never commit `.env` files, passwords, database URLs with credentials, or JWT secrets.
- Keep `node_modules/`, build outputs, and local uploads out of version control.
- Use environment-specific configuration when deploying.

## Project Purpose

YourEvent was developed as a full-stack diploma project to demonstrate frontend development, REST API design, authentication, relational database integration, and practical event-management workflows.
