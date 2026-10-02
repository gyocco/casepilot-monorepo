import { ApplicationError } from '@casepilot/abstractions';

export class ConflictError extends ApplicationError {
  constructor(message = 'The operation conflicts with the current data.') {
    super('CONFLICT_ERROR', message);
  }
}
