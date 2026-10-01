import { ArgumentsHost, Catch, HttpStatus, Inject, type ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { HealthDatabaseUnavailableError } from '../../application/queries/get-health-check-objects.query.js';
import { DatabaseUnavailableHttpResponse } from './health-http.response.js';

@Catch(HealthDatabaseUnavailableError)
export class HealthUnavailableFilter implements ExceptionFilter<HealthDatabaseUnavailableError> {
  constructor(@Inject(HttpAdapterHost) private readonly adapterHost: HttpAdapterHost) {}

  catch(_error: HealthDatabaseUnavailableError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<unknown>();
    this.adapterHost.httpAdapter.setHeader(response, 'Cache-Control', 'no-store');
    this.adapterHost.httpAdapter.reply(response, new DatabaseUnavailableHttpResponse(), HttpStatus.SERVICE_UNAVAILABLE);
  }
}
