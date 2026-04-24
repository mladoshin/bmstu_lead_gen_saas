import { Button } from '@shared/ui';
import { useAuthStore } from '@/store';

export const HomePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <h1 className="text-3xl font-bold text-gray-900">
        Добро пожаловать{user?.name ? `, ${user.name}` : ''}!
      </h1>
      <p className="text-gray-600">B2B Contact Finder</p>
      <Button onClick={logout} className="max-w-xs">
        Выйти
      </Button>
    </div>
  );
};
