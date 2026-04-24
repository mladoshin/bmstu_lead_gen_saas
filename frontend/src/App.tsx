import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GuestGuard } from '@features/auth/GuestGuard';
import { AuthGuard } from '@features/auth/AuthGuard';
import { AuthLayout } from '@layouts/AuthLayout';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { HomePage } from '@pages/HomePage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>
        <Route element={<AuthGuard />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
