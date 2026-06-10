// Roles válidos aceptados por el backend (Defensa Capa 0)
export type ChatRole = 'PACIENTE' | 'MEDICO' | 'EJECUTIVO' | 'ADMIN' | 'GERENCIA';

// Payload enviado a POST /api/ia/chat
export interface ChatRequest {
  message: string;
  sessionId?: string; // Opcional, se omite en el primer mensaje
  role?: ChatRole;
}

// Payload devuelto por el backend
export interface ChatResponse {
  message: string;
  sessionId: string;
}

// Representación interna de un mensaje de chat para la interfaz de usuario
export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}
