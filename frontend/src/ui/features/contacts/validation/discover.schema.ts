import { z } from 'zod';

export const discoverSchema = z.object({
  targetRoles: z
    .string()
    .min(1, 'Укажите хотя бы одну роль'),
});

export type DiscoverFormData = z.infer<typeof discoverSchema>;
