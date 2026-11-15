import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useGetMeQuery } from '../../features/auth/authApi';
import type { Role } from '../../types/auth';

interface ProtectedRouteProps {
  allowedRole: Role;
}

export default function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const { token } = useAppSelector((state) => state.auth);

  const { data: user, isLoading, isFetching, isError } = useGetMeQuery(
    undefined,
    {
      skip: !token,
    }
  );

  if (!token || isError) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (isFetching && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#351018]/20 border-t-[#351018]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'organizer' ? '/organizer' : '/provider'}
        replace
      />
    );
  }

  return <Outlet />;
}