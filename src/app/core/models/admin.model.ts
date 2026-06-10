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

export type DoctorType = 'INTERNO' | 'EXTERNO';

export interface DoctorProfile {
  id:           number;
  userId:       number;
  email:        string;
  firstName:    string;
  lastName:     string;
  fullName:     string;
  idNumber:     string;
  type:         DoctorType;
  officeId:     number | null;
  profilePhoto: string | null;
  specialties:  Specialty[];
  active:       boolean;
  createdAt:    string;
}

export interface DoctorProfileRequest {
  userId:        number;
  email:         string;
  firstName:     string;
  lastName:      string;
  idNumber:      string;
  type:          DoctorType;
  officeId?:     number;
  profilePhoto?: string;
  specialtyIds:  number[];
}

// ─── Horario ──────────────────────────────────────────────────────────────────

export interface Horario {
  id:         number;
  diaSemana:  number;
  horaInicio: string;
  horaFin:    string;
}

export interface HorarioRequest {
  diaSemana:  number;
  horaInicio: string;
  horaFin:    string;
}

// ─── System configuration ─────────────────────────────────────────────────────

export interface SystemConfig {
  id:          number;
  key:         string;
  value:       string;
  description: string;
  active:      boolean;
}

export interface SystemConfigRequest {
  key:          string;
  value:        string;
  description?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id:        number;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      string;
  idType:    string | null;
  idNumber:  string | null;
}

// ─── Notification Rules ───────────────────────────────────────────────────────

export type NotificationRuleType    = 'DAYS_BEFORE' | 'IMMEDIATE';
export type NotificationChannel     = 'WHATSAPP' | 'EMAIL' | 'BOTH';
export type NotificationPurpose     = 'REMINDER' | 'CONFIRMATION';

export interface NotificationRuleResponse {
  id:          number;
  ruleType:    NotificationRuleType;
  daysBefore:  number | null;
  channel:     NotificationChannel;
  purpose:     NotificationPurpose;
  active:      boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface NotificationRuleRequest {
  ruleType:   NotificationRuleType;
  daysBefore: number | null;
  channel:    NotificationChannel;
  purpose:    NotificationPurpose;
  active:     boolean;
}
