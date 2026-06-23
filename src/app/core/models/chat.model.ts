// Payload enviado a POST /api/ia/chat
export interface ChatRequest {
  message: string;
  sessionId?: string;
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
