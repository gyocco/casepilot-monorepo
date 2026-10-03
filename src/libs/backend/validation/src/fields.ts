import { ValidationError, isJsonValue } from '@casepilot/abstractions';
import { uuidPattern } from './identifiers.js';

export type FieldKind = 'string' | 'text' | 'uuid' | 'timestamp' | 'date' | 'decimal' | 'bigint' | 'integer' | 'boolean' | 'json';
export interface FieldRule {
  readonly name: string;
  readonly kind: FieldKind;
  readonly nullable: boolean;
  readonly choices?: readonly string[];
  readonly maxLength?: number;
  readonly nonblank?: boolean;
  readonly pattern?: RegExp;
  readonly min?: number;
  readonly max?: number;
  readonly nonnegative?: boolean;
  readonly integerDigits?: number;
  readonly fractionDigits?: number;
  readonly maxBigInt?: bigint;
  readonly maxJsonDepth?: number;
}


function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

function matchesPattern(value: string, pattern: RegExp): boolean {
  // Do not mutate the caller's RegExp or depend on its global/sticky lastIndex.
  return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).test(value);
}

function validValue(value: unknown, rule: FieldRule): boolean {
  switch (rule.kind) {
    case 'boolean': return typeof value === 'boolean';
    case 'integer': return typeof value === 'number' && Number.isSafeInteger(value)
      && (rule.min === undefined || value >= rule.min) && (rule.max === undefined || value <= rule.max);
    case 'json': return isJsonValue(value, rule.maxJsonDepth ?? 100);
    case 'uuid': return typeof value === 'string' && uuidPattern.test(value);
    case 'decimal': {
      if (typeof value !== 'string' || !/^-?\d+(\.\d+)?$/.test(value) || (rule.nonnegative && value.startsWith('-'))) return false;
      const [integer, fraction = ''] = value.replace(/^-/, '').split('.');
      return (rule.integerDigits === undefined || integer.length <= rule.integerDigits)
        && (rule.fractionDigits === undefined || fraction.length <= rule.fractionDigits);
    }
    case 'bigint': return typeof value === 'string' && /^-?\d+$/.test(value)
      && (!rule.nonnegative || !value.startsWith('-')) && (rule.maxBigInt === undefined || BigInt(value) <= rule.maxBigInt);
    case 'date': return typeof value === 'string' && validDate(value);
    case 'timestamp': return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(value)
      && Number.isFinite(Date.parse(value)) && validDate(value.slice(0, 10));
    case 'text': case 'string': return typeof value === 'string' && (!rule.nonblank || value.trim().length > 0);
  }
}

/** Validate structure against rules explicitly selected by the owning Application. */
export function validateFields(data: object, rules: readonly FieldRule[], partial: boolean): void {
  for (const key of Object.keys(data)) {
    if (!rules.some(rule => rule.name === key)) throw new ValidationError(`Unknown or immutable field: ${key}.`);
  }
  for (const rule of rules) {
    const value: unknown = Reflect.get(data, rule.name);
    if (value === undefined && (partial || rule.nullable)) continue;
    if (value === null && rule.nullable) continue;
    const valid = validValue(value, rule)
      && (rule.choices === undefined || (typeof value === 'string' && rule.choices.includes(value)))
      && (rule.maxLength === undefined || (typeof value === 'string' && value.length <= rule.maxLength))
      && (rule.pattern === undefined || (typeof value === 'string' && matchesPattern(value, rule.pattern)));
    if (!valid) throw new ValidationError(`Invalid field: ${rule.name}.`, {
      details: [{ message: 'Invalid value.', pointer: '/' + rule.name.replaceAll('~', '~0').replaceAll('/', '~1') }],
    });
  }
}
