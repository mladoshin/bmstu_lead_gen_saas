import type { AxiosInstance } from 'axios';
import type { IAuthPort } from '@/core/ports/auth.port';
import type { User } from '@/core/entities/user';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/core/types/auth.types';

export class AuthService implements IAuthPort {
  constructor(private readonly http: AxiosInstance) {}

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.http.get<User>('/auth/me');
    return response.data;
  }
}
