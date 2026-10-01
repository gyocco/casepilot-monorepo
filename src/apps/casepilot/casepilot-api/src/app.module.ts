import { Module, type DynamicModule } from '@nestjs/common';
import type { BackendConfig } from './config/backend-config.js';
import { HealthModule } from './contexts/health/health.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({})
export class AppModule {
  static register(config: BackendConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.register(config.database), HealthModule],
    };
  }
}
