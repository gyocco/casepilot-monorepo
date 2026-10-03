import { STATUS_CODES } from 'node:http';
import { HttpException } from '@nestjs/common';
import {
  ApplicationError, UnexpectedError, ValidationError, ConflictError, NotFoundError, ForbiddenError, UnauthorizedError,
} from '@casepilot/abstractions';
import type { ErrorDetail } from '@casepilot/abstractions';

export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly instance: string;
  readonly code: string;
  readonly detail?: string;
  readonly errors?: readonly ErrorDetail[];
  readonly stack?: string;
}

export interface ErrorMapping {
  readonly error: abstract new (...arguments_: never[]) => Error;
  readonly status: number;
  readonly code: string;
  readonly type?: string;
  /** Overrides the HTTP reason phrase; use a specific type URI with a custom title. */
  readonly title?: string;
  /** Only opt in for errors whose messages are deliberately safe diagnostics. */
  readonly exposeDetails?: boolean;
}

export interface ExceptionHandlerOptions {
  /** Defaults to false. Environment selection is the consumer's responsibility. */
  readonly exposeDetails?: boolean;
  /** First match wins; these mappings precede the built-in mappings. */
  readonly mappings?: readonly ErrorMapping[];
}

const builtInMappings: readonly ErrorMapping[] = [
  { error: UnexpectedError, status: 500, code: 'UNEXPECTED_ERROR' },
  { error: ValidationError, status: 400, code: 'VALIDATION_ERROR' },
  { error: ConflictError, status: 409, code: 'CONFLICT_ERROR' },
  { error: NotFoundError, status: 404, code: 'NOT_FOUND_ERROR' },
  { error: ForbiddenError, status: 403, code: 'FORBIDDEN_ERROR' },
  { error: UnauthorizedError, status: 401, code: 'UNAUTHORIZED_ERROR' },
];

const statusCodes: Readonly<Record<number, string>> = {
  400: 'VALIDATION_ERROR', 401: 'UNAUTHORIZED_ERROR', 403: 'FORBIDDEN_ERROR', 404: 'NOT_FOUND_ERROR',
};

function isErrorStatus(status: number): boolean {
  return Number.isInteger(status) && status >= 400 && status <= 599;
}

function httpDetails(error: HttpException): { detail: string; errors?: readonly ErrorDetail[] } {
  // Nest routing errors can embed the full URL, including credentials in a query string.
  if (error.getStatus() === 404) return { detail: 'The requested resource was not found.' };
  const body: unknown = error.getResponse();
  if (typeof body === 'string') return { detail: body };
  if (body && typeof body === 'object' && 'message' in body) {
    const message: unknown = body.message;
    if (typeof message === 'string') return { detail: message };
    if (Array.isArray(message)) {
      const entries: readonly unknown[] = message;
      const messages = entries.filter((entry): entry is string => typeof entry === 'string');
      if (messages.length > 0) return {
        detail: messages.join('; '), errors: messages.map(value => ({ message: value })),
      };
    }
  }
  return { detail: error.message };
}

export class ProblemDetailsFactory {
  private readonly exposeDetails: boolean;
  private readonly mappings: readonly ErrorMapping[];

  constructor(options: ExceptionHandlerOptions = {}) {
    this.exposeDetails = options.exposeDetails ?? false;
    this.mappings = [...(options.mappings ?? []), ...builtInMappings].map(mapping => ({ ...mapping }));
    for (const mapping of this.mappings) {
      if (!isErrorStatus(mapping.status) || !mapping.code.trim()) {
        throw new TypeError('Error mappings require a 400-599 status and a non-empty code.');
      }
      if (mapping.type !== undefined) {
        try { new URL(mapping.type); } catch {
          throw new TypeError('Error mapping types must be absolute URIs.');
        }
      }
    }
  }

  create(error: unknown, instance: string): ProblemDetails {
    const mapping = this.mappings.find(candidate => error instanceof candidate.error);
    const httpStatus = error instanceof HttpException ? error.getStatus() : 500;
    const status = mapping?.status ?? (isErrorStatus(httpStatus) ? httpStatus : 500);
    const problem: ProblemDetails = {
      type: mapping?.type ?? 'about:blank',
      title: mapping?.title ?? STATUS_CODES[status] ?? (status >= 500 ? 'Server Error' : 'Client Error'),
      status,
      instance,
      code: mapping?.code ?? (status >= 500 ? 'UNEXPECTED_ERROR' : statusCodes[status] ?? 'HTTP_ERROR'),
    };
    if (!this.exposeDetails) return problem;

    // Never serialize arbitrary throwables, provider errors, or their causes/properties.
    if (mapping && error instanceof Error &&
      (mapping.exposeDetails ?? (error instanceof ApplicationError))) {
      return {
        ...problem, detail: error.message,
        ...(error.stack ? { stack: error.stack } : {}),
        ...(error instanceof ApplicationError && error.details.length > 0 ? { errors: error.details } : {}),
      };
    }
    if (!mapping && error instanceof HttpException && status < 500) {
      return { ...problem, ...httpDetails(error) };
    }
    return problem;
  }
}
