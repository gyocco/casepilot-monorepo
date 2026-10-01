import { Controller, Get, Header, Inject } from '@nestjs/common';
import { GetHealthCheckObjectsQuery } from '../../application/queries/get-health-check-objects.query.js';
import { GetHealthCheckObjectsRequest } from '../../application/queries/get-health-check-objects.request.js';
import {
  ApiHealthHttpResponse,
  DatabaseHealthHttpResponse,
  HealthCheckObjectHttpResponse,
} from './health-http.response.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(GetHealthCheckObjectsQuery) private readonly query: GetHealthCheckObjectsQuery) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getApiHealth(): ApiHealthHttpResponse {
    return new ApiHealthHttpResponse();
  }

  @Get('database')
  @Header('Cache-Control', 'no-store')
  async getDatabaseHealth(): Promise<DatabaseHealthHttpResponse> {
    const response = await this.query.execute(new GetHealthCheckObjectsRequest());
    return new DatabaseHealthHttpResponse(
      response.objects.map(object => new HealthCheckObjectHttpResponse(object.guid, object.value)),
    );
  }
}
