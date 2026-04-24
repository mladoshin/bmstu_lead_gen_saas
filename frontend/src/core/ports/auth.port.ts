import type { User } from '../entities/user';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export interface IAuthPort {
  login(data: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  getMe(): Promise<User>;
}
