import { PersistenceError } from '../../domain/errors/persistence-error.js';
import type { JsonValue } from '../../domain/entities/stored-entity.js';
export function isRow(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function sqlRows(value: unknown): Record<string, unknown>[] {
  // TypeORM 0.3 PostgreSQL returns [rows, affectedCount] for UPDATE/DELETE.
  if (Array.isArray(value) && value.length === 2 && Array.isArray(value[0]) && typeof value[1] === 'number') return sqlRows(value[0]);
  if (!Array.isArray(value) || !value.every(isRow)) throw new PersistenceError('unavailable');
  return value;
}
export function sqlString(value: unknown): string {
  if (typeof value !== 'string') throw new PersistenceError('unavailable');
  return value;
}
export function sqlInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) throw new PersistenceError('unavailable');
  return value;
}
export function sqlBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new PersistenceError('unavailable');
  return value;
}
export function sqlTimestamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return sqlString(value);
}
export function sqlDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return sqlString(value);
}
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRow(value) && Object.values(value).every(isJsonValue);
}
export function sqlJson(value: unknown): JsonValue {
  if (!isJsonValue(value)) throw new PersistenceError('unavailable');
  return value;
}
export function sqlChoice<T extends string>(value: unknown, choices: readonly T[]): T {
  for (const choice of choices) if (choice === value) return choice;
  throw new PersistenceError('unavailable');
}
