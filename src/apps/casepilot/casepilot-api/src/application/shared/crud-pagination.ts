import { PageRequest, ValidationError } from '@casepilot/abstractions';
export function validatePage(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string, fields: readonly string[]): PageRequest {
  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100
    || !Number.isSafeInteger((pageNumber - 1) * pageSize) || !fields.includes(sortBy) || (sortDirection !== 'asc' && sortDirection !== 'desc')) {
    throw new ValidationError('Invalid pagination or sorting.');
  }
  return new PageRequest(pageNumber, pageSize, sortBy, sortDirection);
}
export function validateVersion(version: number): void {
  if (!Number.isInteger(version) || version < 1 || version >= 2147483647) throw new ValidationError('A positive version is required.');
}
