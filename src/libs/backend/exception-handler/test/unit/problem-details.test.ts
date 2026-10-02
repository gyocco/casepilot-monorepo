import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { UnexpectedError, ValidationError } from '../../src/index.js';
import { ProblemDetailsFactory } from '../../src/nestjs/index.js';

void test('safe defaults omit detail, validation diagnostics, stack and cause', () => {
  const problem = new ProblemDetailsFactory().create(new ValidationError('private message', {
    details: [{ message: 'private field failure' }], cause: new Error('private cause'),
  }), 'urn:uuid:fixture');
  assert.deepEqual(problem, {
    type: 'about:blank', title: 'Bad Request', status: 400,
    instance: 'urn:uuid:fixture', code: 'VALIDATION_ERROR',
  });
});

void test('detailed mode exposes only typed diagnostics and never traverses a cause', () => {
  const cause: { self?: unknown } = {};
  cause.self = cause;
  const error = new UnexpectedError('Selected diagnostic', { cause });
  const problem = new ProblemDetailsFactory({ exposeDetails: true }).create(error, 'urn:uuid:fixture');
  assert.equal(problem.detail, error.message);
  assert.equal(problem.stack, error.stack);
  assert.doesNotThrow(() => JSON.stringify(problem));
  assert.equal('cause' in problem, false);
});

void test('custom mappings override built-ins, support subclasses and require explicit diagnostic exposure', () => {
  class SpecificValidationError extends ValidationError {}
  const problem = new ProblemDetailsFactory({
    exposeDetails: true,
    mappings: [{ error: ValidationError, status: 422, code: 'INVALID_INPUT',
      type: 'https://example.test/problems/invalid-input', title: 'Invalid input', exposeDetails: false }],
  }).create(new SpecificValidationError('private message'), 'urn:uuid:fixture');
  assert.equal(problem.status, 422);
  assert.equal(problem.type, 'https://example.test/problems/invalid-input');
  assert.equal(problem.title, 'Invalid input');
  assert.equal(problem.code, 'INVALID_INPUT');
  assert.equal(problem.detail, undefined);
  class ConflictError extends Error {}
  const custom = new ProblemDetailsFactory({ exposeDetails: true, mappings: [
    { error: ConflictError, status: 409, code: 'CONFLICT', exposeDetails: true },
  ] }).create(new ConflictError('Selected conflict diagnostic'), 'urn:uuid:fixture');
  assert.equal(custom.detail, 'Selected conflict diagnostic');
});

void test('unknown throwables and framework 5xx cannot leak provider properties even in detailed mode', () => {
  const factory = new ProblemDetailsFactory({ exposeDetails: true });
  for (const error of [
    new Error('SELECT private_table, password=private'), 'private thrown string', null, undefined,
    { status: 401, statusCode: 404, message: 'private message' },
    new InternalServerErrorException({ message: 'private provider error', sql: 'private query' }),
    new HttpException('private message', 200),
  ]) {
    const problem = factory.create(error, 'urn:uuid:fixture');
    assert.equal(problem.status, 500);
    assert.equal(problem.title, 'Internal Server Error');
    assert.equal(problem.code, 'UNEXPECTED_ERROR');
    assert.equal(problem.detail, undefined);
    assert.equal(problem.stack, undefined);
    assert.doesNotMatch(JSON.stringify(problem), /private|SELECT/);
  }
});

void test('Nest validation messages are selected structurally without exposing arbitrary response properties', () => {
  const problem = new ProblemDetailsFactory({ exposeDetails: true }).create(new BadRequestException({
    message: ['email must be valid', 'name is required', { password: 'private' }],
    password: 'private', target: { token: 'private' },
  }), 'urn:uuid:fixture');
  assert.equal(problem.detail, 'email must be valid; name is required');
  assert.deepEqual(problem.errors, [{ message: 'email must be valid' }, { message: 'name is required' }]);
  assert.doesNotMatch(JSON.stringify(problem), /private|password|token/);
});

void test('invalid mappings are rejected during configuration', () => {
  for (const status of [200, 399, 600, 400.5, NaN]) {
    assert.throws(() => new ProblemDetailsFactory({ mappings: [
      { error: Error, status, code: 'INVALID' },
    ] }), TypeError);
  }
  assert.throws(() => new ProblemDetailsFactory({ mappings: [
    { error: Error, status: 400, code: ' ' },
  ] }), TypeError);
  assert.throws(() => new ProblemDetailsFactory({ mappings: [
    { error: Error, status: 400, code: 'ERROR', type: 'relative/type' },
  ] }), TypeError);
});
