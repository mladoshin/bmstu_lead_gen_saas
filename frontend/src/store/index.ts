import { LocalTokenStorage } from '@/api/storage/local-token-storage';
import { createAxiosInstance } from '@/api/http/axios-instance';
import { AuthService } from '@/api/services/auth.service';
import { createAuthStore } from './auth.store';

const tokenStorage = new LocalTokenStorage();
const axiosInstance = createAxiosInstance(tokenStorage);
const authService = new AuthService(axiosInstance);

export const useAuthStore = createAuthStore(authService, tokenStorage);
