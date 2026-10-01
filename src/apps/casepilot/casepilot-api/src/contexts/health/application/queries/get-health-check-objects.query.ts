import {
  HealthCheckObjectRepositoryUnavailableError,
  type HealthCheckObjectRepository,
} from '../../domain/repositories/health-check-object.repository.js';
import type { GetHealthCheckObjectsRequest } from './get-health-check-objects.request.js';
import { GetHealthCheckObjectsResponse, HealthCheckObjectResponse } from './get-health-check-objects.response.js';

export class HealthDatabaseUnavailableError extends Error {}

export class GetHealthCheckObjectsQuery {
  constructor(private readonly repository: HealthCheckObjectRepository) {}

  async execute(_request: GetHealthCheckObjectsRequest): Promise<GetHealthCheckObjectsResponse> {
    try {
      const objects = await this.repository.getAll();
      return new GetHealthCheckObjectsResponse(
        objects.map(object => new HealthCheckObjectResponse(object.guid, object.value)),
      );
    } catch (error: unknown) {
      if (error instanceof HealthCheckObjectRepositoryUnavailableError) {
        throw new HealthDatabaseUnavailableError('The health database dependency is unavailable.');
      }
      throw error;
    }
  }
}
