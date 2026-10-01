import { Module, type DynamicModule } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { DatabaseConfig } from '../config/backend-config.js';
import { createDataSourceOptions } from './create-data-source-options.js';
import { DatabaseConnection } from './database-connection.js';

@Module({})
export class DatabaseModule {
  static register(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [{
        provide: DatabaseConnection,
        useFactory: (): DatabaseConnection => new DatabaseConnection(new DataSource(createDataSourceOptions(config))),
      }],
      exports: [DatabaseConnection],
    };
  }
}
