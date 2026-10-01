import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseConnection } from '../../database/database-connection.js';
import { GetHealthCheckObjectsQuery } from './application/queries/get-health-check-objects.query.js';
import type { HealthCheckObjectRepository } from './domain/repositories/health-check-object.repository.js';
import { TypeOrmHealthCheckObjectRepository } from './infrastructure/persistence/repositories/typeorm-health-check-object.repository.js';
import { HealthController } from './presentation/http/health.controller.js';
import { HealthUnavailableFilter } from './presentation/http/health-unavailable.filter.js';

const HEALTH_CHECK_OBJECT_REPOSITORY = Symbol('HEALTH_CHECK_OBJECT_REPOSITORY');

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: HEALTH_CHECK_OBJECT_REPOSITORY,
      inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): HealthCheckObjectRepository =>
        new TypeOrmHealthCheckObjectRepository(connection),
    },
    {
      provide: GetHealthCheckObjectsQuery,
      inject: [HEALTH_CHECK_OBJECT_REPOSITORY],
      useFactory: (repository: HealthCheckObjectRepository): GetHealthCheckObjectsQuery =>
        new GetHealthCheckObjectsQuery(repository),
    },
    { provide: APP_FILTER, useClass: HealthUnavailableFilter },
  ],
})
export class HealthModule {}
