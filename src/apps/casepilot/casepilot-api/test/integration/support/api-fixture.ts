import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { UnauthorizedError } from '@casepilot/abstractions';
import type { TokenVerifier, VerifiedIdentity } from '@casepilot/auth';
import { createApp } from '../../../src/create-app.js';
import type { BackendConfig } from '../../../src/infrastructure/config/backend-config.js';
import { createDataSourceOptions } from '../../../src/infrastructure/database/create-data-source-options.js';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

export interface HealthObjectFixture {
  readonly guid: string;
  readonly value: string;
}

export const migratedHealthObject: HealthObjectFixture = {
  guid: '00000000-0000-4000-8000-000000000001',
  value: 'CasePilot API',
};

export const defaultFixtureIdentities: Readonly<Record<string, VerifiedIdentity>> = {
  'owner-token': {
    provider: 'firebase',
    subject: 'fixture-uid-owner',
    email: 'owner.fixture@casepilot.test',
    emailVerified: true,
    displayName: 'Fixture Owner',
  },
  'outsider-token': {
    provider: 'firebase',
    subject: 'fixture-uid-outsider',
    email: 'outsider.fixture@casepilot.test',
    emailVerified: true,
    displayName: 'Fixture Outsider',
  },
  'viewer-token': {
    provider: 'firebase',
    subject: 'fixture-uid-viewer',
    email: 'viewer.fixture@casepilot.test',
    emailVerified: true,
    displayName: 'Fixture Viewer',
  },
};

export interface ApiFixture {
  readonly database: DataSource;
  readonly baseUrl: string;
  get(path: '/health' | '/health/database'): Promise<Response>;
  request(path: string, method?: string, body?: object, token?: string | null): Promise<Response>;
  resetHealthObjects(objects?: readonly HealthObjectFixture[]): Promise<void>;
  close(): Promise<void>;
}

export async function startApiFixture(
  options: {
    readonly stopDatabaseBeforeApiStart?: boolean;
    readonly identities?: Readonly<Record<string, VerifiedIdentity>>;
  } = {},
): Promise<ApiFixture> {
  // Only this owned, freshly created container can provide connection settings.
  const container = await new PostgreSqlContainer('postgres:18-bookworm')
    .withDatabase(`casepilot_test_${randomBytes(8).toString('hex')}`)
    .withUsername('casepilot_test')
    .withPassword(randomBytes(24).toString('hex'))
    .withLabels({ 'com.casepilot.purpose': 'endpoint-tests' })
    .withStartupTimeout(120_000)
    .start();

  let containerStopped = false;
  let database: DataSource | undefined;
  let app: Awaited<ReturnType<typeof createApp>> | undefined;

  async function close(): Promise<void> {
    try {
      if (app) await app.close();
    } finally {
      try {
        if (database?.isInitialized) await database.destroy();
      } finally {
        if (!containerStopped) {
          await container.stop({ timeout: 10_000, remove: true, removeVolumes: true });
          containerStopped = true;
        }
      }
    }
  }

  try {
    const config: BackendConfig = {
      environment: 'test',
      http: { host: '127.0.0.1', port: 0, corsOrigins: [], exposeErrorDetails: true },
      database: {
        host: container.getHost(), port: container.getPort(),
        database: container.getDatabase(), username: container.getUsername(), password: container.getPassword(),
        schema: 'public', ssl: false, connectTimeoutMs: 1000, queryTimeoutMs: 1000, poolSize: 5,
      },
      auth: { firebaseProjectId: 'demo-casepilot-test', emulatorHost: null },
    };
    const ownedDatabase = new DataSource(createDataSourceOptions(config.database));
    database = ownedDatabase;
    await ownedDatabase.initialize();
    await ownedDatabase.runMigrations({ transaction: 'all' });

    if (options.stopDatabaseBeforeApiStart) {
      await ownedDatabase.destroy();
      await container.stop({ timeout: 10_000, remove: true, removeVolumes: true });
      containerStopped = true;
    }

    const identityMap = options.identities ?? defaultFixtureIdentities;
    const tokenVerifier: TokenVerifier = {
      verify(token: string): Promise<VerifiedIdentity> {
        const match = identityMap[token];
        if (!match) return Promise.reject(new UnauthorizedError('Invalid test token.'));
        return Promise.resolve(match);
      },
    };

    app = await createApp(config, false, { tokenVerifier });
    await app.listen(config.http.port, config.http.host);
    const baseUrl = await app.getUrl();

    return {
      database: ownedDatabase,
      baseUrl,
      get: path => fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5000) }),
      request: (path, method = 'GET', body, token = null) => {
        const headers: Record<string, string> = {};
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        if (token) headers.Authorization = `Bearer ${token}`;
        return fetch(`${baseUrl}${path}`, {
          method,
          signal: AbortSignal.timeout(10000),
          headers,
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      },
      async resetHealthObjects(objects = [migratedHealthObject]): Promise<void> {
        await ownedDatabase.query('TRUNCATE TABLE "HealthCheckObject"');
        for (const object of objects) {
          await ownedDatabase.query('INSERT INTO "HealthCheckObject" ("Guid", "Value") VALUES ($1, $2)', [
            object.guid, object.value,
          ]);
        }
      },
      close,
    };
  } catch (error: unknown) {
    await close();
    throw error;
  }
}
