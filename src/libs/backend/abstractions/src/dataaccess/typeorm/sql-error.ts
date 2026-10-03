import { QueryFailedError } from 'typeorm';
import { PersistenceError } from '../persistence-error.js';
import { isRow } from './sql-values.js';

export function normalizeSqlError(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  const driver: unknown = error instanceof QueryFailedError ? error.driverError : error;
  const code = isRow(driver) ? driver.code : null;
  switch (code) {
    case '23505': return new PersistenceError('unique', { cause: error });
    case '23503': return new PersistenceError('reference', { cause: error });
    case '23502': return new PersistenceError('required', { cause: error });
    case '40001': case '40P01': return new PersistenceError('concurrent', { cause: error });
    default: return new PersistenceError('unavailable', { cause: error });
  }
}
