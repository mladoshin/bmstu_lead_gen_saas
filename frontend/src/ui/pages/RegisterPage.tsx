import { RegisterForm } from '@features/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Регистрация</h1>
      <RegisterForm />
    </>
  );
};
