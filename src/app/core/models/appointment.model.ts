// src/app/core/models/appointment.model.ts

// --- Type aliases ---
export type FlowType = 'manual' | 'quick';
export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

// --- Catalog ---
export interface SpecialtyCatalog {
  id: number;
  nombre: string;
  icono: string | null;            // Pure Base64 string
  iconoMimeType: string | null;    // e.g., 'image/png'
  descripcion: string | null;
  cantidadMedicos: number;         // Assuming this might be useful to show later
}

export interface SpecialtyDoctor {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  rating: number;
  yearsOfExperience: number;
  careType: 'INTERNO' | 'EXTERNO';
  assignedOfficeId: number | null;
  assignedOfficeNumber: number | null;
}

export interface DoctorAvailability {
  doctorId: number;
  doctorName: string;
  date: string;
  availableTimes: string[];
  slotDurationMinutes: number;
}

// --- Manual appointment (request uses Spanish field names to match API body) ---
export interface CreateAppointmentRequest {
  medicoId: number;
  consultorioId: number | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

// --- Appointment response (English names, mapped in service) ---
export interface AppointmentResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  specialty: string;
  officeNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: AppointmentStatus;
}

// --- Quick appointment ---
export interface QuickProposalResponse {
  reservationId: string;
  doctorId: number;
  doctorName: string;
  specialtyId: number;
  specialtyName: string;
  officeId: number;
  officeNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  expiresInSeconds: number;
  message: string;
}

// Request uses Spanish field names to match API body
export interface ConfirmQuickRequest {
  reservaId: string;
  motivo: string;
}