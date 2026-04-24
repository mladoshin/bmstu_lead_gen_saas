import { create } from 'zustand';
import type { User } from '@/core/entities/user';
import type { IAuthPort } from '@/core/ports/auth.port';
import type { ITokenStorage } from '@/core/ports/token-storage.port';
import type { LoginRequest, RegisterRequest, ApiError } from '@/core/types/auth.types';
import { AxiosError } from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

function normalizeError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as ApiError;
    if (Array.isArray(data.message)) {
      return data.message.join('. ');
    }
    return data.message || 'Произошла ошибка';
  }
  return 'Произошла ошибка';
}

export function createAuthStore(authPort: IAuthPort, tokenStorage: ITokenStorage) {
  return create<AuthState>((set) => ({
    user: null,
    token: tokenStorage.getToken(),
    isAuthenticated: false,
    isAuthChecked: false,
    isLoading: false,
    error: null,

    login: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authPort.login(data);
        tokenStorage.setToken(response.accessToken);
        set({
          user: response.user,
          token: response.accessToken,
          isAuthenticated: true,
          isAuthChecked: true,
          isLoading: false,
        });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authPort.register(data);
        tokenStorage.setToken(response.accessToken);
        set({
          user: response.user,
          token: response.accessToken,
          isAuthenticated: true,
          isAuthChecked: true,
          isLoading: false,
        });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    logout: () => {
      tokenStorage.removeToken();
      set({ user: null, token: null, isAuthenticated: false, isAuthChecked: true, error: null });
    },

    checkAuth: async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        set({ isAuthenticated: false, isAuthChecked: true, isLoading: false });
        return;
      }
      set({ isLoading: true });
      try {
        const user = await authPort.getMe();
        set({ user, token, isAuthenticated: true, isAuthChecked: true, isLoading: false });
      } catch {
        tokenStorage.removeToken();
        set({ user: null, token: null, isAuthenticated: false, isAuthChecked: true, isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  }));
}
