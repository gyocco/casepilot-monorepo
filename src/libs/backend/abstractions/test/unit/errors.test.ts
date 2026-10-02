import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApplicationError, UnexpectedError, ValidationError, NotFoundError, ForbiddenError,
  UnauthorizedError, UnauthroizedError,
} from '../../src/index.js';

void test('shared errors carry transport-independent codes, diagnostics and an unexposed cause', () => {
  const cause = new Error('private provider failure');
  for (const [ErrorType, code] of [
    [UnexpectedError, 'UNEXPECTED_ERROR'], [ValidationError, 'VALIDATION_ERROR'],
    [NotFoundError, 'NOT_FOUND_ERROR'], [ForbiddenError, 'FORBIDDEN_ERROR'],
    [UnauthorizedError, 'UNAUTHORIZED_ERROR'],
  ] as const) {
    const error = new ErrorType('Selected diagnostic', {
      cause, details: [{ message: 'Invalid format', pointer: '/email', code: 'FORMAT' }],
    });
    assert.ok(error instanceof Error);
    assert.ok(error instanceof ApplicationError);
    assert.equal(error.name, ErrorType.name);
    assert.equal(error.code, code);
    assert.equal(error.message, 'Selected diagnostic');
    assert.equal(error.cause, cause);
    assert.equal('status' in error, false);
    assert.deepEqual(error.details, [{ message: 'Invalid format', pointer: '/email', code: 'FORMAT' }]);
    assert.ok(new ErrorType().message.length > 0);
  }
  assert.equal(UnauthroizedError, UnauthorizedError);
});
