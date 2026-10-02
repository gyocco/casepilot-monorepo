import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as abstractions from '@casepilot/abstractions';
import * as errors from '../../src/index.js';
import { ProblemDetailsFactory } from '../../src/nestjs/problem-details.js';

void test('compatibility exports preserve shared constructors and their HTTP mapping', () => {
  for (const name of [
    'ApplicationError', 'UnexpectedError', 'ValidationError', 'NotFoundError',
    'ForbiddenError', 'UnauthorizedError', 'UnauthroizedError',
  ] as const) {
    assert.equal(errors[name], abstractions[name]);
  }
  const problem = new ProblemDetailsFactory().create(new abstractions.UnexpectedError(), 'urn:uuid:fixture');
  assert.equal(problem.status, 500);
  assert.equal(problem.code, 'UNEXPECTED_ERROR');
  assert.equal(problem.detail, undefined);
});
