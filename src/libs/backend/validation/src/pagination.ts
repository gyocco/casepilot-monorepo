import { PageRequest, ValidationError } from '@casepilot/abstractions';

export interface PaginationRules {
  readonly maxPageSize: number;
  readonly sortFields: readonly string[];
}

export function validatePage(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string, rules: PaginationRules): PageRequest {
  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > rules.maxPageSize
    || !Number.isSafeInteger((pageNumber - 1) * pageSize) || !rules.sortFields.includes(sortBy) || (sortDirection !== 'asc' && sortDirection !== 'desc')) {
    throw new ValidationError('Invalid pagination or sorting.');
  }
  return new PageRequest(pageNumber, pageSize, sortBy, sortDirection);
}

export function validateVersion(version: number, rules: { readonly min: number; readonly maxExclusive: number }): void {
  if (!Number.isSafeInteger(version) || version < rules.min || version >= rules.maxExclusive) throw new ValidationError('A valid version is required.');
}
