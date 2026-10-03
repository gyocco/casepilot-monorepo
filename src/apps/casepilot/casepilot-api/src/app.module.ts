import { Module, type DynamicModule } from '@nestjs/common';
import { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';
import { ApiModule } from './api.module.js';
import type { BackendConfig } from './infrastructure/config/backend-config.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';

@Module({
  imports: [ApiModule],
})
export class AppModule {
  static register(config: BackendConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.register(config.database),
        ExceptionHandlerModule.register({
          exposeDetails: config.http.exposeErrorDetails,
        }),
      ],
    };
  }
}
