import type { HealthCheckObject } from '../entities/health-check-object.js';

export interface HealthCheckObjectRepository {
  getAll(): Promise<readonly HealthCheckObject[]>;
}

export class HealthCheckObjectRepositoryUnavailableError extends Error {}
