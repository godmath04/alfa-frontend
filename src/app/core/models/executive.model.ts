export type PatientStatus = 'ACTIVE' | 'GUEST' | 'INACTIVE';

export interface PacienteSearch {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string | null;
  idType:    string | null;
  idNumber:  string | null;
  status:    PatientStatus;
}

export interface CrearPacienteRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  idType:    string;
  idNumber:  string;
  phone:     string;
  birthDate: string;
  city:      string;
  gender:    string;
}

export interface EjecutivoCitaItem {
  id:               number;
  medicoNombre:     string;
  especialidad:     string;
  consultorioNumero: string;
  fecha:            string;
  horaInicio:       string;
  horaFin:          string;
  motivo:           string | null;
  estado:           string;
}
