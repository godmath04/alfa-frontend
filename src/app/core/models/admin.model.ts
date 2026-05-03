// ─── Specialty ────────────────────────────────────────────────────────────────

export interface Specialty {
  id:                  number;
  name:                string;
  icon:                string;
  description:         string;
  appointmentDuration: number;
  active:              boolean;
}

export interface SpecialtyRequest {
  name:                string;
  icon?:               string;
  description?:        string;
  appointmentDuration: number;
}

// ─── Office ───────────────────────────────────────────────────────────────────

export type OfficeType   = 'INTERNAL' | 'EXTERNAL';
export type OfficeStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Office {
  id:           number;
  number:       string;
  floor:        string;
  type:         OfficeType;
  status:       OfficeStatus;
  specialtyId:  number | null;
  specialtyName: string | null;
  equipment:    string[];
  active:       boolean;
}

export interface OfficeRequest {
  number:      string;
  floor?:      string;
  type:        OfficeType;
  status:      OfficeStatus;
  specialtyId?: number;
  equipment:   string[];
}

// ─── Attention schedule ───────────────────────────────────────────────────────

export interface AttentionSchedule {
  id:              number;
  category:        string;
  days:            string[];
  startTime:       string;
  endTime:         string;
  maxAppointments: number;
  active:          boolean;
}

export interface AttentionScheduleRequest {
  category:        string;
  days:            string[];
  startTime:       string;
  endTime:         string;
  maxAppointments: number;
}

// ─── Doctor profile ───────────────────────────────────────────────────────────

export interface DoctorProfile {
  id:           number;
  userId:       number;
  firstName:    string;
  lastName:     string;
  fullName:     string;
  idNumber:     string;
  profilePhoto: string | null;
  specialties:  Specialty[];
  active:       boolean;
  createdAt:    string;
}

export interface DoctorProfileRequest {
  userId:       number;
  firstName:    string;
  lastName:     string;
  idNumber:     string;
  profilePhoto?: string;
  specialtyIds: number[];
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id:        number;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      string;
}
