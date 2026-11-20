import { Module, type DynamicModule } from '@nestjs/common';
import type { TokenVerifier } from '@casepilot/auth';
import { FirebaseTokenVerifier } from '@casepilot/auth/firebase';
import { NestAuthModule } from '@casepilot/auth/nestjs';
import { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';
import { ApiModule } from './api.module.js';
import type { BackendConfig } from './infrastructure/config/backend-config.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';

export interface AppModuleOptions {
  readonly tokenVerifier?: TokenVerifier;
}

@Module({
  imports: [ApiModule],
})
export class AppModule {
  static register(config: BackendConfig, options: AppModuleOptions = {}): DynamicModule {
    const verifier = options.tokenVerifier ?? new FirebaseTokenVerifier({
      projectId: config.auth.firebaseProjectId,
      emulatorHost: config.auth.emulatorHost,
    });
    return {
      module: AppModule,
      imports: [
        DatabaseModule.register(config.database),
        ExceptionHandlerModule.register({
          exposeDetails: config.http.exposeErrorDetails,
        }),
        NestAuthModule.register({ verifier }),
      ],
    };
  }
}
