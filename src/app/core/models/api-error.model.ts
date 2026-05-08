import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorBody {
  message?: string;
  code?: string;
}

export interface ApiError {
  status: number;
  error: ApiErrorBody;
  name: string;
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    return {
      status: err.status,
      error: (err.error as ApiErrorBody) ?? {},
      name: err.name,
    };
  }
  return { status: 0, error: {}, name: String(err) };
}
