import type { PageRequest } from '@casepilot/abstractions';
import { validatePage as validatePagination, validateVersion as validateStoredVersion } from '@casepilot/validation';

/** CasePilot's endpoint page cap; other APIs supply their own limit. */
export function validatePage(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string, fields: readonly string[]): PageRequest {
  return validatePagination(pageNumber, pageSize, sortBy, sortDirection, { maxPageSize: 100, sortFields: fields });
}

/** Leave room for the increment in CasePilot's PostgreSQL integer version. */
export function validateVersion(version: number): void {
  validateStoredVersion(version, { min: 1, maxExclusive: 2147483647 });
}
