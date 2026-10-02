import { ValidationError } from '@casepilot/abstractions';
import type { JsonValue } from '../../domain/entities/stored-entity.js';

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateId(value: string): void {
  if (!uuidPattern.test(value)) throw new ValidationError('A valid UUID is required.');
}

export type FieldKind = 'string' | 'text' | 'uuid' | 'timestamp' | 'date' | 'decimal' | 'bigint' | 'integer' | 'boolean' | 'json';

export interface FieldRule {
  readonly name: string;
  readonly kind: FieldKind;
  readonly nullable: boolean;
  readonly choices?: readonly string[];
}

function validJson(value: unknown, depth = 0): value is JsonValue {
  if (depth > 20) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(item => validJson(item, depth + 1));
  if (typeof value === 'object') return Object.values(value).every(item => validJson(item, depth + 1));
  return false;
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateFields(data: object, rules: readonly FieldRule[], partial: boolean): void {
  for (const key of Object.keys(data)) {
    if (!rules.some(rule => rule.name === key)) throw new ValidationError(`Unknown or immutable field: ${key}.`);
  }
  for (const rule of rules) {
    const value: unknown = Reflect.get(data, rule.name);
    if (value === undefined && (partial || rule.nullable)) continue;
    if (value === null && rule.nullable) continue;
    let valid: boolean;
    switch (rule.kind) {
      case 'boolean': valid = typeof value === 'boolean'; break;
      case 'integer': valid = typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647; break;
      case 'json': valid = validJson(value); break;
      case 'uuid': valid = typeof value === 'string' && uuidPattern.test(value); break;
      case 'decimal': valid = typeof value === 'string' && /^-?\d{1,16}(\.\d{1,4})?$/.test(value); break;
      case 'bigint': valid = typeof value === 'string' && /^\d{1,19}$/.test(value) && BigInt(value) <= 9223372036854775807n; break;
      case 'date': valid = typeof value === 'string' && validDate(value); break;
      case 'timestamp': valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && validDate(value.slice(0, 10)); break;
      case 'text': valid = typeof value === 'string' && value.length <= 100000; break;
      case 'string': valid = typeof value === 'string' && value.trim().length > 0 && value.length <= 255; break;
    }
    if (valid && rule.choices) valid = typeof value === 'string' && rule.choices.includes(value);
    if (!valid) throw new ValidationError(`Invalid field: ${rule.name}.`, { details: [{ message: 'Invalid value.', pointer: `/${rule.name}` }] });
    if (value !== null && value !== undefined && typeof value === 'string') {
      if (rule.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ValidationError('Invalid email.');
      if (rule.name === 'currency' && !/^[A-Z]{3}$/.test(value)) throw new ValidationError('Currency must have three uppercase letters.');
      if (rule.name === 'countryCode' && !/^[A-Z]{2}$/.test(value)) throw new ValidationError('Country code must have two uppercase letters.');
      if (rule.kind === 'decimal' && rule.name !== 'valueNumber' && value.startsWith('-')) throw new ValidationError(`Invalid nonnegative amount: ${rule.name}.`);
    }
  }
}

export function validateChronology(start: string | null, end: string | null): void {
  if (start !== null && end !== null && Date.parse(end) < Date.parse(start)) throw new ValidationError('The end must not precede the start.');
}
