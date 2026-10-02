import { randomUUID } from 'node:crypto';
import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { ProblemDetailsFactory, type ExceptionHandlerOptions } from './problem-details.js';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter<unknown> {
  private readonly problems: ProblemDetailsFactory;

  constructor(private readonly adapterHost: HttpAdapterHost, options: ExceptionHandlerOptions = {}) {
    this.problems = new ProblemDetailsFactory(options);
  }

  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<unknown>();
    const adapter = this.adapterHost.httpAdapter;
    if (adapter.isHeadersSent(response)) return;
    const problem = this.problems.create(error, `urn:uuid:${randomUUID()}`);
    adapter.setHeader(response, 'Content-Type', 'application/problem+json');
    adapter.setHeader(response, 'Cache-Control', 'no-store');
    adapter.reply(response, problem, problem.status);
  }
}
