# YourEvent — Frontend

The frontend of **YourEvent** is a responsive event-planning application built with React and TypeScript.

It provides interfaces for event organizers and service providers, allowing users to manage events, explore services, communicate, and organize event-related activities.

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Building reusable user interface components |
| TypeScript | Static typing and improved code reliability |
| Vite | Fast development server and production builds |
| Tailwind CSS | Responsive styling and consistent design |
| Redux Toolkit | Managing application state |
| RTK Query | API requests, caching, and server-state management |
| React Router | Client-side routing and navigation |
| Lucide React | Interface icons |

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Configuration

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Ensure the backend server is running before using features that require API access.