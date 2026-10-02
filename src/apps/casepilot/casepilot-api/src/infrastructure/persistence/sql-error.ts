import { QueryFailedError } from 'typeorm';
import { PersistenceError } from '../../domain/errors/persistence-error.js';
import { isRow } from './sql-values.js';
export function normalizeSqlError(error: unknown): PersistenceError {
  const driver: unknown = error instanceof QueryFailedError ? error.driverError : error;
  const code = isRow(driver) ? driver.code : null;
  switch (code) {
    case '23505': return new PersistenceError('unique');
    case '23503': return new PersistenceError('reference');
    case '23502': return new PersistenceError('required');
    case '40001': case '40P01': return new PersistenceError('concurrent');
    default: return new PersistenceError('unavailable');
  }
}
