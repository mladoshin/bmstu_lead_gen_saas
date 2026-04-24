import { LoginForm } from '@features/auth/LoginForm';

export const LoginPage = () => {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Вход</h1>
      <LoginForm />
    </>
  );
};
