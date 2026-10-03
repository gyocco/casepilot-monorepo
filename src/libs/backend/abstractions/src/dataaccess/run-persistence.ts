import { PersistenceError } from './persistence-error.js';
import { UnitOfWorkError } from './unit-of-work-error.js';

/** Application must supply the policy; unrelated failures keep their identity. */
export async function runPersistence<T>(
  operation: () => Promise<T>,
  translateError: (error: PersistenceError | UnitOfWorkError) => Error,
): Promise<T> {
  try { return await operation(); }
  catch (error: unknown) {
    if (error instanceof PersistenceError || error instanceof UnitOfWorkError) throw translateError(error);
    throw error;
  }
}
