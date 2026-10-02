import type { DataSourceOptions } from 'typeorm';
import type { DatabaseConfig } from '../config/backend-config.js';
import { healthCheckObjectSchema } from '../persistence/schemas/health-check-object.schema.js';
import { professionalServicesSchemas } from '../persistence/schemas/professional-services.schemas.js';
import { CreateProfessionalServices1790899200000 } from './migrations/1790899200000-create-professional-services.js';
import { CreateHealthCheckObject1790726400000 } from './migrations/1790726400000-create-health-check-object.js';

export function createDataSourceOptions(config: DatabaseConfig): DataSourceOptions {
  return {
    type: 'postgres',
    uuidExtension: 'pgcrypto',
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    schema: config.schema,
    ssl: config.ssl,
    connectTimeoutMS: config.connectTimeoutMs,
    poolSize: config.poolSize,
    extra: { statement_timeout: config.queryTimeoutMs, query_timeout: config.queryTimeoutMs },
    entities: [healthCheckObjectSchema, ...professionalServicesSchemas],
    migrations: [CreateHealthCheckObject1790726400000, CreateProfessionalServices1790899200000],
    migrationsTableName: 'casepilot_api_migrations',
    synchronize: false,
    migrationsRun: false,
    logging: false,
    invalidWhereValuesBehavior: { null: 'throw', undefined: 'throw' },
    installExtensions: false,
  };
}
