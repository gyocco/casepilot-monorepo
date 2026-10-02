import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Request, Response, type Handler } from '../src/index.js';

class EchoRequest extends Request {
  constructor(public readonly value: string) { super(); }
}

class EchoResponse extends Response {
  constructor(public readonly value: string) { super(); }
}

class EchoHandler implements Handler<EchoRequest, EchoResponse> {
  execute(request: EchoRequest): Promise<EchoResponse> {
    return Promise.resolve(new EchoResponse(request.value));
  }
}

class RejectHandler implements Handler<EchoRequest, EchoResponse> {
  constructor(private readonly failure: Error) {}

  execute(_request: EchoRequest): Promise<EchoResponse> {
    return Promise.reject(this.failure);
  }
}

void test('a query can be constructed and invoked directly without a container or dispatcher', async () => {
  const query = new EchoHandler();
  const response = await query.execute(new EchoRequest('example'));
  assert.ok(response instanceof EchoResponse);
  assert.ok(response instanceof Response);
  assert.equal(response.value, 'example');
});

void test('direct command execution preserves the original error for its caller', async () => {
  const failure = new Error('synthetic failure');
  const command = new RejectHandler(failure);
  await assert.rejects(command.execute(new EchoRequest('example')), error => error === failure);
});
