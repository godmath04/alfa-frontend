// ─── Admin catalog models ─────────────────────────────────────────────────────

export interface StudyType {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export interface InsuranceType {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export interface LabSchedule {
  id: number;
  dayOfWeek: number;   // 1=Mon … 7=Sun (ISO)
  startTime: string;   // "HH:mm:ss"
  endTime: string;
  slotDurationMinutes: number;
}

export interface Laboratory {
  id: number;
  number: string;
  name: string;
  floor: string | null;
  active: boolean;
  schedules: LabSchedule[];
}

export interface LaboratoryRequest {
  number: string;
  name: string;
  floor?: string;
}

export interface LaboratoryScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface StudyTypeRequest {
  name: string;
  description?: string;
}

export interface InsuranceTypeRequest {
  name: string;
  description?: string;
}

// ─── Agendamiento catalog ─────────────────────────────────────────────────────

export interface LabCatalogSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface LabCatalog {
  id: number;
  number: string;
  name: string;
  floor: string | null;
  schedules: LabCatalogSchedule[];
}

export interface LabDisponibilidad {
  labId: number;
  labName: string;
  labNumber: string;
  fecha: string;
  slotDurationMinutes: number;
  horariosDisponibles: string[];
}

// ─── Booking request / response ───────────────────────────────────────────────

export interface LabCitaRequest {
  labId: number;
  fecha: string;
  horaInicio: string;
  studyTypeId: number;
  studyTypeName: string;
  insuranceTypeId: number;
  insuranceTypeName: string;
  observations?: string;
  // Ejecutivo — registered patient
  pacienteId?: number;
  // Ejecutivo — GUEST patient
  guestNombre?: string;
  guestApellido?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestIdNumber?: string;
}

export interface LabCitaResponse {
  id: number;
  pacienteId: number | null;
  pacienteNombre: string;
  pacienteEmail: string;
  pacientePhone: string;
  pacienteIdNumber: string;
  labId: number;
  labName: string;
  labNumber: string;
  labFloor: string | null;
  studyTypeId: number;
  studyTypeName: string;
  insuranceTypeId: number;
  insuranceTypeName: string;
  observations: string | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface MisLabCitasItem {
  citaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  labName: string;
  labNumber: string;
  labFloor: string | null;
  studyTypeName: string;
  insuranceTypeName: string;
  estado: string;
}

export interface StaffLabCitaItem {
  citaId:            number;
  pacienteNombre:    string;
  pacienteEmail:     string;
  pacienteIdNumber:  string | null;
  fecha:             string;
  horaInicio:        string;
  horaFin:           string;
  labName:           string;
  labNumber:         string;
  labFloor:          string | null;
  studyTypeName:     string | null;
  insuranceTypeName: string | null;
  estado:            string;
  guest:             boolean;
  originalFileName?: string | null;
}

// ─── Lab results ──────────────────────────────────────────────────────────────

export interface LabResult {
  id: string;
  citaId: number;
  pacienteId: number | null;
  pacienteEmail: string;
  pacienteNombre: string;
  labName: string;
  labNumber: string;
  studyTypeName: string;
  insuranceTypeName: string;
  observations: string | null;
  s3Key: string | null;
  originalFileName: string | null;
  fileSize: number | null;
  estado: string;
  uploadedAt: string | null;
  createdAt: string;
  guest: boolean;
}

export interface GuestResult {
  id: string;
  citaFecha: string;
  citaHoraInicio: string;
  labName: string;
  studyTypeName: string;
  originalFileName: string | null;
  estado: string;
  token: string | null;
}
