import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Имя обязательно'),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Некорректный email'),
    password: z
      .string()
      .min(8, 'Пароль должен быть не менее 8 символов'),
    confirmPassword: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
