import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GuestGuard } from '@features/auth/GuestGuard';
import { AuthGuard } from '@features/auth/AuthGuard';
import { AuthLayout } from '@layouts/AuthLayout';
import { MainLayout } from '@layouts/MainLayout';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { HomePage } from '@pages/HomePage';
import { SearchPage } from '@pages/SearchPage';
import { ContactsPage } from '@pages/ContactsPage';

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
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/contacts/:selectionId" element={<ContactsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
