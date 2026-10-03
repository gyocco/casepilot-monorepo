import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { readBody, stringValue, nullableString, choiceValue, nullableJson, PageMetadataHttpResponse } from '../src/nestjs/index.js';

void test('HTTP structural parsers use caller-selected fields and never accept arbitrary bodies', () => {
  const body = readBody({ label: 'example', nullable: null }, ['label', 'nullable']);
  assert.equal(stringValue(body, 'label'), 'example');
  assert.equal(nullableString(body, 'nullable'), null);
  assert.equal(nullableString(body, 'missing'), undefined);
  assert.equal(choiceValue(body, 'label', ['example']), 'example');
  assert.throws(() => readBody({ private: true }, ['label']), BadRequestException);
  assert.throws(() => readBody([], ['label']), BadRequestException);
  assert.throws(() => stringValue({ label: 5 }, 'label'), BadRequestException);
  assert.throws(() => nullableJson({ metadata: Number.NaN }, 'metadata'), BadRequestException);
  assert.deepEqual({ ...new PageMetadataHttpResponse(new PageMetadataResponse(1, 10, 0, 0, false, false)) }, {
    pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false,
  });
});
