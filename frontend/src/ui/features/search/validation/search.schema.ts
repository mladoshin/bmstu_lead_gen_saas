import { z } from 'zod';

export const searchSchema = z.object({
  industry: z
    .string()
    .min(1, 'Отрасль обязательна'),
  cities: z
    .string()
    .min(1, 'Укажите хотя бы один город'),
  companyLimit: z.coerce
    .number()
    .min(1, 'Минимум 1')
    .max(500, 'Максимум 500'),
});

export type SearchFormData = z.infer<typeof searchSchema>;
