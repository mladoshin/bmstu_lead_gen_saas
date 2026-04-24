import type { User } from '../entities/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}
