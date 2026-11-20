import { Injectable, InjectionToken, inject } from '@angular/core';

export type WebEnvironment = 'local' | 'development' | 'staging' | 'production';

export interface FirebasePublicConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
}

export interface AppConfig {
  readonly environment: WebEnvironment;
  readonly apiBaseUrl: string;
  readonly firebase: FirebasePublicConfig;
  readonly authEmulatorUrl: string | null;
}

export const DEFAULT_LOCAL_APP_CONFIG: AppConfig = Object.freeze({
  environment: 'local',
  apiBaseUrl: 'http://127.0.0.1:3000',
  firebase: Object.freeze({
    apiKey: 'demo-casepilot-local-api-key',
    authDomain: 'demo-casepilot-local.firebaseapp.com',
    projectId: 'demo-casepilot-local',
    appId: '1:000000000000:web:localdemo',
  }),
  authEmulatorUrl: 'http://127.0.0.1:9099',
});

export const APP_CONFIG = new InjectionToken<AppConfig>('CASEPILOT_APP_CONFIG');

function requireNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid public configuration: ${label} must be a non-empty string.`);
  }
  return value.trim();
}

function validateHttpUrl(value: string, label: string): string {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid public configuration: ${label} must use HTTP or HTTPS.`);
  }
  return value.replace(/\/+$/, '');
}

export function validateAppConfig(raw: unknown): AppConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid public configuration: expected an object.');
  }
  const source = raw as Record<string, unknown>;
  const environment = source['environment'];
  if (environment !== 'local' && environment !== 'development' && environment !== 'staging' && environment !== 'production') {
    throw new Error('Invalid public configuration: unsupported environment.');
  }
  const apiBaseUrl = validateHttpUrl(requireNonEmptyString(source['apiBaseUrl'], 'apiBaseUrl'), 'apiBaseUrl');
  const firebaseRaw = source['firebase'];
  if (!firebaseRaw || typeof firebaseRaw !== 'object' || Array.isArray(firebaseRaw)) {
    throw new Error('Invalid public configuration: firebase section is required.');
  }
  const fb = firebaseRaw as Record<string, unknown>;
  const firebase: FirebasePublicConfig = {
    apiKey: requireNonEmptyString(fb['apiKey'], 'firebase.apiKey'),
    authDomain: requireNonEmptyString(fb['authDomain'], 'firebase.authDomain'),
    projectId: requireNonEmptyString(fb['projectId'], 'firebase.projectId'),
    appId: requireNonEmptyString(fb['appId'], 'firebase.appId'),
  };
  const rawEmulator = source['authEmulatorUrl'];
  let authEmulatorUrl: string | null = null;
  if (rawEmulator !== undefined && rawEmulator !== null && rawEmulator !== '') {
    if (environment !== 'local') {
      throw new Error('Invalid public configuration: authEmulatorUrl is permitted only in local.');
    }
    authEmulatorUrl = validateHttpUrl(requireNonEmptyString(rawEmulator, 'authEmulatorUrl'), 'authEmulatorUrl');
  }
  return { environment, apiBaseUrl, firebase, authEmulatorUrl };
}

@Injectable({ providedIn: 'root' })
export class AppConfigStore {
  private readonly injected = inject(APP_CONFIG, { optional: true });
  private current: AppConfig = this.injected ?? DEFAULT_LOCAL_APP_CONFIG;

  config(): AppConfig {
    return this.current;
  }

  async load(): Promise<void> {
    if (this.injected) {
      this.current = validateAppConfig(this.injected);
      return;
    }
    try {
      const response = await fetch('/app-config.json', { cache: 'no-store' });
      if (!response.ok) return;
      const json: unknown = await response.json();
      this.current = validateAppConfig(json);
    } catch {
      // Fall back to default local config only when running in local/test without a served file.
    }
  }
}
