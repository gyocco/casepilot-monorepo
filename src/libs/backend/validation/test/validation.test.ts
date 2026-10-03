import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ValidationError } from '@casepilot/abstractions';
import { validateFields, validateId, validatePage, validateVersion } from '../src/index.js';

void test('consumers choose page caps, sortable fields and version bounds', () => {
  assert.equal(validatePage(1, 200, 'label', 'desc', { maxPageSize: 500, sortFields: ['label'] }).pageSize, 200);
  assert.throws(() => validatePage(1, 200, 'label', 'asc', { maxPageSize: 100, sortFields: ['label'] }), ValidationError);
  assert.throws(() => validatePage(1, 20, 'private', 'asc', { maxPageSize: 100, sortFields: ['label'] }), ValidationError);
  assert.throws(() => validatePage(Number.MAX_SAFE_INTEGER, 100, 'label', 'asc', { maxPageSize: 100, sortFields: ['label'] }), ValidationError);
  assert.doesNotThrow(() => validateVersion(0, { min: 0, maxExclusive: 10 }));
  assert.throws(() => validateVersion(10, { min: 0, maxExclusive: 10 }), ValidationError);
});

void test('field names carry no implicit policy and explicit constraints are honored', () => {
  assert.doesNotThrow(() => validateFields({ email: 'not an email', amount: '-1.23', count: -5 }, [
    { name: 'email', kind: 'string', nullable: false },
    { name: 'amount', kind: 'decimal', nullable: false },
    { name: 'count', kind: 'integer', nullable: false },
  ], false));
  assert.throws(() => validateFields({ amount: '-1' }, [{ name: 'amount', kind: 'decimal', nullable: false, nonnegative: true }], false), ValidationError);
  assert.throws(() => validateFields({ label: 'long' }, [{ name: 'label', kind: 'text', nullable: false, maxLength: 3 }], false), ValidationError);
  assert.throws(() => validateFields({ value: '1.234' }, [{ name: 'value', kind: 'decimal', nullable: false, fractionDigits: 2 }], false), ValidationError);
  const pattern = /^good$/g;
  for (let i = 0; i < 2; i++) validateFields({ label: 'good' }, [{ name: 'label', kind: 'string', nullable: false, pattern }], false);
  assert.equal(pattern.lastIndex, 0);
});

void test('partial updates, nullable fields, JSON safety and dates are validated structurally', () => {
  const rules = [{ name: 'label', kind: 'string', nullable: false }] as const;
  assert.doesNotThrow(() => validateFields({}, rules, true));
  assert.throws(() => validateFields({}, rules, false), ValidationError);
  assert.throws(() => validateFields({ label: null }, rules, true), ValidationError);
  assert.throws(() => validateFields({ extra: 'value' }, rules, true), ValidationError);
  const cycle: { self?: unknown } = {}; cycle.self = cycle;
  assert.throws(() => validateFields({ data: cycle }, [{ name: 'data', kind: 'json', nullable: false }], false), ValidationError);
  assert.throws(() => validateFields({ date: '2026-02-30' }, [{ name: 'date', kind: 'date', nullable: false }], false), ValidationError);
  assert.throws(() => validateId('bad'), ValidationError);
  assert.throws(() => validateFields({ 'a/b~c': false }, [{ name: 'a/b~c', kind: 'string', nullable: false }], false), (error: unknown) =>
    error instanceof ValidationError && error.details[0]?.pointer === '/a~1b~0c');
});
