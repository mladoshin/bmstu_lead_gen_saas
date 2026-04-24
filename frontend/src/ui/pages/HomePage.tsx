import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store';

export const HomePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Добро пожаловать{user?.name ? `, ${user.name}` : ''}!
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/search"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900">Поиск компаний</h2>
          <p className="mt-1 text-sm text-gray-600">
            Найти B2B-компании по отрасли и городам
          </p>
        </Link>
      </div>
    </div>
  );
};
