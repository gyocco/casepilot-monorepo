import { UnexpectedError, UnitOfWorkError, ValidationError } from '@casepilot/abstractions';
import { PersistenceError } from '../../domain/errors/persistence-error.js';
import { ConflictError } from './conflict-error.js';

export async function runPersistence<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error: unknown) {
    if (error instanceof UnitOfWorkError) throw new UnexpectedError();
    if (error instanceof PersistenceError) {
      switch (error.reason) {
        case 'unique': throw new ConflictError('A unique value already exists.');
        case 'reference': throw new ConflictError('A referenced record is missing or still in use.');
        case 'concurrent': throw new ConflictError('The data changed concurrently. Read it again before retrying.');
        case 'required': throw new ValidationError();
        case 'unavailable': throw new UnexpectedError();
      }
    }
    throw error;
  }
}
