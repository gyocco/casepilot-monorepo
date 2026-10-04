import type { Handler } from '@casepilot/cqrs';
import { UnexpectedError } from '@casepilot/abstractions';
import {
  HealthCheckObjectRepositoryUnavailableError,
  type HealthCheckObjectRepository,
} from '../../../domain/repositories/health-check-object.repository.js';
import type { GetHealthCheckObjectsRequest } from './get-health-check-objects.request.js';
import { GetHealthCheckObjectsResponse, HealthCheckObjectResponse } from './get-health-check-objects.response.js';

export class GetHealthCheckObjectsHandler implements Handler<GetHealthCheckObjectsRequest, GetHealthCheckObjectsResponse> {
  constructor(private readonly repository: HealthCheckObjectRepository) {}

  async execute(_request: GetHealthCheckObjectsRequest): Promise<GetHealthCheckObjectsResponse> {
    try {
      const objects = await this.repository.getAll();
      return new GetHealthCheckObjectsResponse(
        objects.map(object => new HealthCheckObjectResponse(object.guid, object.value)),
      );
    } catch (error: unknown) {
      if (error instanceof HealthCheckObjectRepositoryUnavailableError) {
        throw new UnexpectedError();
      }
      throw error;
    }
  }
}
