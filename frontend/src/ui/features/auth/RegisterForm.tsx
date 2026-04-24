import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button, Input } from '@shared/ui';
import { useAuthStore } from '@/store';
import { registerSchema, type RegisterFormData } from './validation/register.schema';

export const RegisterForm = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = ({ name, email, password }: RegisterFormData) => {
    registerUser({ name, email, password });
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
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="text"
            label="Имя"
            placeholder="Ваше имя"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

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
            placeholder="Минимум 8 символов"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="password"
            label="Подтверждение пароля"
            placeholder="Повторите пароль"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Button type="submit" loading={isLoading}>
        Зарегистрироваться
      </Button>

      <p className="text-sm text-center text-gray-600">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
};
