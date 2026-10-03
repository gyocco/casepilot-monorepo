import { ConflictError, UnexpectedError, UnitOfWorkError, ValidationError, runPersistence } from '@casepilot/abstractions';

/** CasePilot CRUD error policy, selected by its handlers. */
export async function runCrudPersistence<T>(operation: () => Promise<T>): Promise<T> {
  return runPersistence(operation, error => {
    if (error instanceof UnitOfWorkError) return new UnexpectedError(undefined, { cause: error });
    switch (error.reason) {
      case 'unique': return new ConflictError('A unique value already exists.', { cause: error });
      case 'reference': return new ConflictError('A referenced record is missing or still in use.', { cause: error });
      case 'concurrent': return new ConflictError('The data changed concurrently. Read it again before retrying.', { cause: error });
      case 'required': return new ValidationError(undefined, { cause: error });
      case 'unavailable': case 'invalid-data': return new UnexpectedError(undefined, { cause: error });
    }
  });
}
