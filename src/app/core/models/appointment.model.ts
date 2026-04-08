// src/app/core/models/appointment.model.ts

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
}