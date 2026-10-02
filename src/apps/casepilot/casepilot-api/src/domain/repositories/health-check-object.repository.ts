import type { Repository } from '@casepilot/abstractions';
import type { HealthCheckObject } from '../entities/health-check-object.js';

export interface HealthCheckObjectRepository extends Repository<HealthCheckObject> {
  getAll(): Promise<readonly HealthCheckObject[]>;
}

export class HealthCheckObjectRepositoryUnavailableError extends Error {}
