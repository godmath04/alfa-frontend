export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token:  string;
  role:   string;
  status: string;
}

export interface ActivateAccountRequest {
  token:    string;   // UUID extracted from URL query param
  password: string;
}

export interface ActivateAccountResponse {
  email:  string;
  role:   string;
  status: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  city: string;
  gender: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
