import { Module, type DynamicModule } from '@nestjs/common';
import { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';
import { GetHealthCheckObjectsHandler, HealthDatabaseUnavailableError } from './application/health/get-health-check-objects.handler.js';
import type { HealthCheckObjectRepository } from './domain/repositories/health-check-object.repository.js';
import type { BackendConfig } from './infrastructure/config/backend-config.js';
import { DatabaseConnection } from './infrastructure/database/database-connection.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { TypeOrmHealthCheckObjectRepository } from './infrastructure/persistence/repositories/typeorm-health-check-object.repository.js';
import { HealthController } from './presentation/http/health.controller.js';

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
export class AppModule {
  static register(config: BackendConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.register(config.database),
        ExceptionHandlerModule.register({
          exposeDetails: config.http.exposeErrorDetails,
          mappings: [{ error: HealthDatabaseUnavailableError, status: 503, code: 'DATABASE_UNAVAILABLE' }],
        }),
      ],
    };
  }
}
