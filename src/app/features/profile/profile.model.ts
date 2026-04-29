export interface ProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  gender: string;
  birthDate: string;
  city: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  gender: string;
  birthDate: string;
}
