import { AxiosError } from 'axios';
import type { ApiError } from '@/core/types/auth.types';

export function normalizeError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as ApiError;
    if (Array.isArray(data.message)) {
      return data.message.join('. ');
    }
    return data.message || 'Произошла ошибка';
  }
  return 'Произошла ошибка';
}
