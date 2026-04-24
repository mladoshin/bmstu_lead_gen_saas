import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button, Input } from '@shared/ui';
import { useAuthStore } from '@/store';
import { loginSchema, type LoginFormData } from './validation/login.schema';

export const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="password"
            label="Пароль"
            placeholder="Введите пароль"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Button type="submit" loading={isLoading}>
        Войти
      </Button>

      <p className="text-sm text-center text-gray-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
};
