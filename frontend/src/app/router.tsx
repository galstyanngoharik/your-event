import { createBrowserRouter, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/layout/ProtectedRoute';
import OrganizerLayout from '../components/layout/OrganizerLayout';
import ProviderLayout from '../components/layout/ProviderLayout';

import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ServicesPage from '../pages/organizer/Service/ServicesPage';
import ServiceDetailsPage from '../pages/organizer/Service/ServiceDetailsPage';
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';
import MyEventsPage from '../pages/organizer/Event/MyEventsPage';
import EventMoodboardPage from '../pages/organizer/Event/EventMoodboardPage';
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderServicesPage from '../pages/provider/ProviderServicesPage';
import ProviderServiceFormPage from '../pages/provider/ProviderServiceFormPage';
import ProviderServiceDetailsPage from '../pages/provider/ProviderServiceDetailsPage';
import ProviderProfileEditPage from '../pages/provider/ProviderProfilePage';
import ProviderPortfolioPage from '../pages/provider/ProviderPortfolioPage';
import CreateEventPage from '../pages/organizer/Event/CreateEventPage';
import EventDetailsPage from '../pages/organizer/Event/EventDetailsPage';
import EditEventPage from '../pages/organizer/Event/EditEventPage';
import PublicInvitationPage from '../pages/public/PublicInvitationPage';
import FavoritesPage from '../pages/organizer/FavoritePage';
import MessagesPage from '../pages/messages/MessagesPage';
import ProviderProfilePage from '../pages/organizer/ProviderProfilePage';
import OrganizerProfilePage from '../pages/organizer/OrganizerProfilePage';
import LandingPage from '../pages/public/LandingPage';
export const router = createBrowserRouter([
    {
    path: '/',
    element: <LandingPage />,
    },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/invite/:token',
    element: <PublicInvitationPage />,
  },
  {
    element: <ProtectedRoute allowedRole="organizer" />,
    children: [
      {
        path: '/organizer',
        element: <OrganizerLayout />,
        children: [
          {
            index: true,
            element: <OrganizerDashboard />,
          },
          {
            path: 'events',
            element: <MyEventsPage />,
          },
          {
            path: 'events/new',
            element: <CreateEventPage />,
          },
          {
            path: 'events/:id',
            element: <EventDetailsPage />,
          },
          {
            path: 'events/:id/edit',
            element: <EditEventPage />,
          },
          {
            path: 'events/:eventId/moodboard',
            element: <EventMoodboardPage />,
          },
          {
            path: 'profile',
            element: <OrganizerProfilePage />,
            },
          {
            path: 'favorites',
            element: <FavoritesPage />,
            },
          {
            path: 'services',
            element: <ServicesPage />,
            },
            {
            path: 'services/:id',
            element: <ServiceDetailsPage />,
            },
            {
            path: 'providers/:id',
            element: <ProviderProfilePage />,
            },
            {
            path: 'messages',
            element: <MessagesPage />,
            },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRole="provider" />,
    children: [
      {
        path: '/provider',
        element: <ProviderLayout />,
        children: [
          { index: true, element: <ProviderDashboard /> },
          { path: 'services', element: <ProviderServicesPage /> },
          { path: 'services/new', element: <ProviderServiceFormPage /> },
          { path: 'services/:id', element: <ProviderServiceDetailsPage /> },
          { path: 'services/:id/edit', element: <ProviderServiceFormPage /> },
          { path: 'profile', element: <ProviderProfileEditPage /> },
          { path: 'portfolio', element: <ProviderPortfolioPage /> },
          { path: 'messages', element: <MessagesPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);