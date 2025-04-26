export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}