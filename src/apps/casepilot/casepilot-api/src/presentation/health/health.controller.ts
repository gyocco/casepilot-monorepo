import { Controller, Get, Header, Inject } from '@nestjs/common';
import { GetHealthCheckObjectsHandler } from '../../application/health/get-health-check-objects.handler.js';
import { GetHealthCheckObjectsRequest } from '../../application/health/get-health-check-objects.request.js';
import {
  ApiHealthHttpResponse,
  DatabaseHealthHttpResponse,
  HealthCheckObjectHttpResponse,
} from './health-http.response.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(GetHealthCheckObjectsHandler) private readonly handler: GetHealthCheckObjectsHandler) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getApiHealth(): ApiHealthHttpResponse {
    return new ApiHealthHttpResponse();
  }

  @Get('database')
  @Header('Cache-Control', 'no-store')
  async getDatabaseHealth(): Promise<DatabaseHealthHttpResponse> {
    const response = await this.handler.execute(new GetHealthCheckObjectsRequest());
    return new DatabaseHealthHttpResponse(
      response.objects.map(object => new HealthCheckObjectHttpResponse(object.guid, object.value)),
    );
  }
}
