export interface DoctorAppointment {
  id:             number;
  patientId:      number;
  patientName:    string;
  specialty:      string;
  officeNumber:   number;
  date:           string;
  startTime:      string;
  endTime:        string;
  reason:         string;
  status:         'PENDIENTE' | 'CONFIRMADA';
}

export interface DailyAgenda {
  date:         string;
  appointments: DoctorAppointment[];
}
