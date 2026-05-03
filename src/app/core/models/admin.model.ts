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
