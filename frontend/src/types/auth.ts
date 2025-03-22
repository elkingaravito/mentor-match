import { User } from './user';

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
  status: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'mentor' | 'mentee';
}

export interface RefreshTokenResponse {
  data: {
    token: string;
  };
  message: string;
  status: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorAuthRequest {
  code: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}