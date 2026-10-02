export interface ErrorDetail {
  readonly message: string;
  readonly code?: string;
  /** JSON Pointer to the invalid field; never include its submitted value. */
  readonly pointer?: string;
}

export interface ApplicationErrorOptions {
  readonly cause?: unknown;
  /** Explicitly selected diagnostics suitable for the configured audience. */
  readonly details?: readonly ErrorDetail[];
}

/** Technical error vocabulary. Application decides when and why to throw it. */
export abstract class ApplicationError extends Error {
  public readonly details: readonly ErrorDetail[];

  protected constructor(
    public readonly code: string,
    message: string,
    options: ApplicationErrorOptions = {},
  ) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.details = (options.details ?? []).map(detail => ({
      message: detail.message,
      ...(detail.code !== undefined ? { code: detail.code } : {}),
      ...(detail.pointer !== undefined ? { pointer: detail.pointer } : {}),
    }));
  }
}

export class UnexpectedError extends ApplicationError {
  constructor(message = 'An unexpected error occurred.', options: ApplicationErrorOptions = {}) {
    super('UNEXPECTED_ERROR', message, options);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = 'The request is invalid.', options: ApplicationErrorOptions = {}) {
    super('VALIDATION_ERROR', message, options);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'The requested resource was not found.', options: ApplicationErrorOptions = {}) {
    super('NOT_FOUND_ERROR', message, options);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Access to the requested resource is forbidden.', options: ApplicationErrorOptions = {}) {
    super('FORBIDDEN_ERROR', message, options);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Authentication is required.', options: ApplicationErrorOptions = {}) {
    super('UNAUTHORIZED_ERROR', message, options);
  }
}

/** Compatibility with the spelling in the initial request. */
export { UnauthorizedError as UnauthroizedError };
