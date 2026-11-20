import { HttpErrorResponse } from '@angular/common/http';

export interface ProblemDetailFieldError {
  readonly message: string;
  readonly pointer?: string;
  readonly code?: string;
}

export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly code?: string;
  readonly errors?: readonly ProblemDetailFieldError[];
}

export interface ApiErrorInfo {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly details: readonly string[];
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeHttpError(error: unknown): ApiErrorInfo {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con la API. Verifica que el backend esté activo.',
        details: [],
      };
    }
    const body = isProblemDetails(error.error) ? error.error : null;
    const code = typeof body?.code === 'string' ? body.code : `HTTP_${error.status}`;
    const details = Array.isArray(body?.errors)
      ? body.errors.map(item => (item.pointer ? `${item.pointer}: ${item.message}` : item.message))
      : [];
    const fallbackMessage = error.status === 401
      ? 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.'
      : error.status === 403
        ? 'No tienes permisos para realizar esta acción.'
        : error.status === 404
          ? 'No se encontró el recurso solicitado.'
          : error.status === 409
            ? 'El registro cambió en paralelo. Recarga antes de volver a guardar.'
            : 'Ocurrió un error al comunicarse con el servidor.';
    const message = typeof body?.detail === 'string' && body.detail.trim().length > 0
      ? body.detail
      : fallbackMessage;
    return { status: error.status, code, message, details };
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return { status: 0, code: 'CLIENT_ERROR', message: error.message, details: [] };
  }
  return {
    status: 0,
    code: 'UNEXPECTED_ERROR',
    message: 'Ocurrió un error inesperado.',
    details: [],
  };
}
