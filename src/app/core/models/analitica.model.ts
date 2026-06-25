export interface AnaliticaHealthResponse {
  status: string;
  service: string;
  dependencies: {
    sqlServer: string;
    mongoDb: string;
    redis: string;
  };
}

export interface KpiTile {
  value: number;
  unit: string | null;
  delta: number;
  trend: 'FLAT' | 'UP' | 'DOWN';
  period: 'day' | 'week' | 'month';
  colorHint: 'neutral' | 'success' | 'error' | 'warning';
  sparkline: number[];
}

export interface HeaderKpisResponse {
  pacientesActivos: KpiTile;
  doctoresActivos: KpiTile;
  citasHoy: KpiTile;
  noShowRatePct: KpiTile;
  labTurnaroundHoras: KpiTile;
  notifDeliveryPct: KpiTile;
}

export interface CitasPorEstadoResponse {
  period: string;
  completadas: number;
  pendientes: number;
  canceladas: number;
}

export interface CitasPorEspecialidadResponse {
  total: number;
  categorias: {
    nombre: string;
    cantidad: number;
    pct: number;
  }[];
}

export interface LabEstudiosTopResponse {
  estudios: {
    estudio: string;
    solicitados: number;
    disponibles: number;
    pct: number;
  }[];
}

export interface LabTurnaroundResponse {
  promedioHoras: number;
  total: number;
  pendientes: number;
  disponibles: number;
}

export interface NotificacionesResumenResponse {
  total: number;
  entregadas: number;
  fallidas: number;
  deliveryRatePct: number;
  porCanal: {
    canal: string;
    total: number;
    pct: number;
  }[];
}

export interface ChatbotResumenResponse {
  sesiones: number;
  mensajes: number;
  promedioMensajesPorSesion: number;
}

export interface TopMedicosResponse {
  medicos: {
    id: number;
    nombreCompleto: string;
    medicoId: string;
    fotoUrl: string | null;
    especialidad: string;
    tipo: string;
    totalCitas: number;
    calificacion: number;
  }[];
}

export interface TendenciaInasistenciaResponse {
  periodo: string;
  tasa: number;
  totalCitas: number;
  inasistencias: number;
}

export interface AnaliticaLaboratorioResponse {
  examenesPorEspecialidad: {
    especialidad: string;
    cantidad: number;
    porcentaje: number;
  }[];
  tendenciaSemanal: {
    periodo: string;
    total: number;
  }[];
  distribucionResultados: {
    normalPct: number;
    anormalPct: number;
    normalCount: number;
    anormalCount: number;
  };
}
