import { ValidationError } from '@casepilot/abstractions';
import { validateFields as validateStructure, type FieldRule } from '@casepilot/validation';

/** CasePilot's storage/input limits; the generic validator does not choose them. */
export function validateFields(data: object, rules: readonly FieldRule[], partial: boolean): void {
  validateStructure(data, rules.map(rule => ({
    ...(rule.kind === 'string' ? { maxLength: 255, nonblank: true } : {}),
    ...(rule.kind === 'text' ? { maxLength: 100000 } : {}),
    ...(rule.kind === 'integer' ? { min: 0, max: 2147483647 } : {}),
    ...(rule.kind === 'decimal' ? { integerDigits: 16, fractionDigits: 4 } : {}),
    ...(rule.kind === 'bigint' ? { maxLength: 19, maxBigInt: 9223372036854775807n, nonnegative: true } : {}),
    ...(rule.kind === 'json' ? { maxJsonDepth: 20 } : {}),
    ...rule,
  })), partial);
}

/** Functional date ordering is a CasePilot policy invoked by resource rules. */
export function validateChronology(start: string | null, end: string | null): void {
  if (start !== null && end !== null && Date.parse(end) < Date.parse(start)) throw new ValidationError('The end must not precede the start.');
}
