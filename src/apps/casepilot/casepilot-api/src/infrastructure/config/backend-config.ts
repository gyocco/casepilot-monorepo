export type ApplicationEnvironment = 'local' | 'test' | 'development' | 'staging' | 'production';

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly schema: string;
  readonly ssl: false | { readonly rejectUnauthorized: true; readonly ca?: string };
  readonly connectTimeoutMs: number;
  readonly queryTimeoutMs: number;
  readonly poolSize: number;
}

export interface AuthConfig {
  readonly firebaseProjectId: string;
  readonly emulatorHost: string | null;
}

export interface BackendConfig {
  readonly environment: ApplicationEnvironment;
  readonly http: {
    readonly host: string;
    readonly port: number;
    readonly corsOrigins: readonly string[];
    readonly exposeErrorDetails: boolean;
  };
  readonly database: DatabaseConfig;
  readonly auth: AuthConfig;
}
