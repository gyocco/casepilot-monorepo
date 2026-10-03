import type { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { HealthCheckObject } from '../../../domain/entities/health-check-object.js';
import {
  HealthCheckObjectRepositoryUnavailableError,
  type HealthCheckObjectRepository,
} from '../../../domain/repositories/health-check-object.repository.js';
import { healthCheckObjectSchema } from '../schemas/health-check-object.schema.js';

export class TypeOrmHealthCheckObjectRepository implements HealthCheckObjectRepository {
  constructor(private readonly connection: DatabaseConnection) {}

  async getAll(): Promise<readonly HealthCheckObject[]> {
    try {
      const source = await this.connection.getDataSource();
      const rows = await source.getRepository(healthCheckObjectSchema).find({ order: { guid: 'ASC' } });
      return rows.map(row => new HealthCheckObject(row.guid, row.value));
    } catch {
      throw new HealthCheckObjectRepositoryUnavailableError('HealthCheckObject storage is unavailable.');
    }
  }
}
