import { inject, makeEnvironmentProviders, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { AppConfigStore } from '../config/app-config';
import { AUTH_PROVIDER_ADAPTER } from './auth.models';
import { FirebaseAuthAdapter } from './firebase-auth.adapter';

export function provideCoreAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(AppConfigStore).load()),
    { provide: AUTH_PROVIDER_ADAPTER, useExisting: FirebaseAuthAdapter },
  ]);
}
