import axios from 'axios';
import type { ITokenStorage } from '@/core/ports/token-storage.port';

export function createAxiosInstance(tokenStorage: ITokenStorage) {
  const instance = axios.create({
    baseURL: '/api',
  });

  instance.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}
