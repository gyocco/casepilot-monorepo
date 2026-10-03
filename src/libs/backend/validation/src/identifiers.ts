import { ValidationError } from '@casepilot/abstractions';

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateId(value: string): void {
  if (!uuidPattern.test(value)) throw new ValidationError('A valid UUID is required.');
}
