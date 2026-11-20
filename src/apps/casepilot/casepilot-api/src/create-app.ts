import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, type AppModuleOptions } from './app.module.js';
import type { BackendConfig } from './infrastructure/config/backend-config.js';

export async function createApp(
  config: BackendConfig,
  logging = true,
  options: AppModuleOptions = {},
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule.register(config, options), {
    logger: logging ? ['log', 'warn', 'error'] : false,
    abortOnError: false,
  });
  app.enableShutdownHooks();
  if (config.http.corsOrigins.length > 0) {
    app.enableCors({ origin: [...config.http.corsOrigins], credentials: false });
  }
  return app;
}
