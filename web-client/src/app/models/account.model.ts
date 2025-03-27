export interface LoginRequest {
  emailUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  userId: string;
  username: string;
  preferredUserDateFormat: string;
  preferredUserTimeFormat: string;
  requirePasswordChange: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  preferredUserDateFormat: string;
  preferredUserTimeFormat: string;
}

export interface RegisterResponse {
  message: string;
  errors: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
