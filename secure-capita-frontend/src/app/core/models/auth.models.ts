export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  message: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    message: string;
}

export interface ApiResponse {
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface User {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
}
