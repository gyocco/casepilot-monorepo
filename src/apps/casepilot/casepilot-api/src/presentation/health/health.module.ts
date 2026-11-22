import { Module } from '@nestjs/common';
import { GetHealthCheckObjectsHandler } from '../../application/health/get-health-check-objects/get-health-check-objects.handler.js';
import type { HealthCheckObjectRepository } from '../../domain/repositories/health-check-object.repository.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmHealthCheckObjectRepository } from '../../infrastructure/persistence/repositories/typeorm-health-check-object.repository.js';
import { HealthController } from './health.controller.js';

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
      provide: GetHealthCheckObjectsHandler,
      inject: [HEALTH_CHECK_OBJECT_REPOSITORY],
      useFactory: (repository: HealthCheckObjectRepository): GetHealthCheckObjectsHandler =>
        new GetHealthCheckObjectsHandler(repository),
    },
  ],
})
export class HealthModule {}
