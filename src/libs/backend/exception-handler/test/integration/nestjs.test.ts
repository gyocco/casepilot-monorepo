import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BadRequestException, Controller, Get, Module, ParseIntPipe, Query, UseGuards, type CanActivate,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { throwError, type Observable } from 'rxjs';
import { UnexpectedError, ValidationError, NotFoundError, ForbiddenError, UnauthorizedError } from '../../src/index.js';
import { ExceptionHandlerModule, type ProblemDetails } from '../../src/nestjs/index.js';

class DenyGuard implements CanActivate {
  canActivate(): boolean { throw new ForbiddenError('Selected permission diagnostic'); }
}

@Controller('errors')
class ErrorController {
  @Get('unexpected')
  unexpected(): never { throw new UnexpectedError('Selected unexpected diagnostic', { cause: new Error('private cause') }); }

  @Get('validation')
  validation(): Promise<never> {
    return Promise.reject(new ValidationError('Selected validation diagnostic', {
      details: [{ message: 'Email must be valid', pointer: '/email', code: 'FORMAT' }],
    }));
  }

  @Get('missing')
  missing(): never { throw new NotFoundError('Selected missing diagnostic'); }

  @Get('forbidden')
  @UseGuards(DenyGuard)
  forbidden(): string { return 'unreachable'; }

  @Get('unauthorized')
  unauthorized(): Observable<never> { return throwError(() => new UnauthorizedError('Selected authentication diagnostic')); }

  @Get('unknown')
  unknown(): never { throw new Error('SELECT private_table, token=private'); }

  @Get('pipe')
  pipe(@Query('value', new ParseIntPipe()) value: number): number { return value; }

  @Get('nest-validation')
  nestValidation(): never { throw new BadRequestException({ message: ['Email is invalid'], password: 'private' }); }
}

@Module({ controllers: [ErrorController] })
class TestModule {}

for (const exposeDetails of [false, true]) {
  void test(`global NestJS filter handles controllers, async failures, guards, pipes and routing (details=${exposeDetails})`, async context => {
    const app = await NestFactory.create({ module: TestModule, imports: [ExceptionHandlerModule.register({ exposeDetails })] }, {
      logger: false, abortOnError: false,
    });
    context.after(() => app.close());
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const instances = new Set<string>();
    for (const [path, status, title, code] of [
      ['unexpected', 500, 'Internal Server Error', 'UNEXPECTED_ERROR'],
      ['validation', 400, 'Bad Request', 'VALIDATION_ERROR'],
      ['missing', 404, 'Not Found', 'NOT_FOUND_ERROR'],
      ['forbidden', 403, 'Forbidden', 'FORBIDDEN_ERROR'],
      ['unauthorized', 401, 'Unauthorized', 'UNAUTHORIZED_ERROR'],
      ['unknown', 500, 'Internal Server Error', 'UNEXPECTED_ERROR'],
      ['pipe?value=invalid', 400, 'Bad Request', 'VALIDATION_ERROR'],
      ['nest-validation', 400, 'Bad Request', 'VALIDATION_ERROR'],
      ['unregistered?token=private', 404, 'Not Found', 'NOT_FOUND_ERROR'],
    ] as const) {
      const response = await fetch(`${url}/errors/${path}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, status, path);
      assert.match(response.headers.get('content-type') ?? '', /^application\/problem\+json\b/);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      // The library owns this response; the runtime assertions below verify its wire contract.
      const body = await response.json() as ProblemDetails;
      assert.equal(body.type, 'about:blank');
      assert.equal(body.status, status);
      assert.equal(body.title, title);
      assert.equal(body.code, code);
      assert.match(body.instance, /^urn:uuid:[0-9a-f-]{36}$/);
      assert.equal(instances.has(body.instance), false);
      instances.add(body.instance);
      if (!exposeDetails || path === 'unknown') {
        assert.deepEqual(Object.keys(body).sort(), ['code', 'instance', 'status', 'title', 'type']);
      } else {
        assert.equal(typeof body.detail, 'string');
        if (path === 'validation') assert.deepEqual(body.errors, [{ message: 'Email must be valid', pointer: '/email', code: 'FORMAT' }]);
      }
      assert.doesNotMatch(JSON.stringify(body), /private|SELECT/);
    }
  });
}
