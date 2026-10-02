import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PageRequest, PageResponse, type Entity } from '../../src/index.js';

class Item implements Entity<string> { constructor(public readonly id: string) {} }

void test('PageRequest uses one-based defaults and calculates offset with sorting', () => {
  const defaults = new PageRequest();
  assert.equal(defaults.pageNumber, 1);
  assert.equal(defaults.pageSize, 20);
  assert.equal(defaults.offset, 0);
  const request = new PageRequest(3, 10, 'id', 'desc');
  assert.equal(request.offset, 20);
  assert.equal(request.sortBy, 'id');
  assert.equal(request.sortDirection, 'desc');
});

void test('PageRequest rejects invalid numbers and unsafe offsets', () => {
  for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => new PageRequest(invalid, 10), RangeError);
    assert.throws(() => new PageRequest(1, invalid), RangeError);
  }
  assert.throws(() => new PageRequest(Number.MAX_SAFE_INTEGER, 2), RangeError);
});

void test('PageResponse calculates empty, first, middle, last and out-of-range metadata', () => {
  for (const [pageNumber, count, pages, next, previous] of [
    [1, 0, 0, false, false], [1, 21, 3, true, false], [2, 21, 3, true, true],
    [3, 21, 3, false, true], [8, 21, 3, false, true],
  ] as const) {
    const response = new PageResponse(new PageRequest(pageNumber, 10), [], count);
    assert.equal(response.pageNumber, pageNumber);
    assert.equal(response.pageSize, 10);
    assert.equal(response.totalCount, count);
    assert.equal(response.totalPages, pages);
    assert.equal(response.hasNextPage, next);
    assert.equal(response.hasPreviousPage, previous);
  }
});

void test('PageResponse snapshots its collection and rejects inconsistent totals', () => {
  const items = [new Item('one')];
  const page = new PageResponse(new PageRequest(1, 1), items, 1);
  items.push(new Item('two'));
  assert.deepEqual(page.items, [new Item('one')]);
  assert.ok(Object.isFrozen(page.items));
  for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => new PageResponse(new PageRequest(), [], invalid), RangeError);
  }
  assert.throws(() => new PageResponse(new PageRequest(1, 1), items, 2), RangeError);
  assert.throws(() => new PageResponse(new PageRequest(), items, 1), RangeError);
});
