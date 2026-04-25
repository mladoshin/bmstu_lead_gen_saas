import { create } from 'zustand';
import type { IAuthStore } from '@/core/ports/auth-store.port';
import type { IAuthPort } from '@/core/ports/auth.port';
import type { ITokenStorage } from '@/core/ports/token-storage.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createAuthStore(authPort: IAuthPort, tokenStorage: ITokenStorage) {
  return create<IAuthStore>((set) => ({
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
