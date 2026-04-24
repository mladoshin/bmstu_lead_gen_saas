import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@shared/ui';
import { useAuthStore } from '@/store';

export const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/search', label: 'Поиск' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="text-lg font-semibold text-gray-900">B2B Contact Finder</span>
              <div className="flex gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium ${
                      location.pathname === link.to
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button onClick={logout} className="!py-1 !px-3 text-sm">
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
