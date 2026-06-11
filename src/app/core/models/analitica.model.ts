export interface AnaliticaHealthResponse {
  status: string;
  service: string;
  dependencies: {
    sqlServer: string;
    mongoDb: string;
    redis: string;
  };
}
