export type Role = 'organizer' | 'provider';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  bio: string | null;
  businessName: string | null;
  workingCities: string[];
  instagram?: string | null;
  phoneNumber?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}