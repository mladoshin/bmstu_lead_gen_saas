import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SpinnerIcon } from '@shared/ui';
import { useAuthStore } from '@/store';

export const AuthGuard = () => {
  const { isAuthenticated, isAuthChecked, checkAuth, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthChecked && token) {
      checkAuth();
    }
  }, [isAuthChecked, token, checkAuth]);

  if (!isAuthChecked) {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SpinnerIcon className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
