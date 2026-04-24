import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';

export const GuestGuard = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
