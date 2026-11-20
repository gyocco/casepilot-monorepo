import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { EnvironmentProviders } from '@angular/core';
import { authTokenInterceptor } from '../auth/auth-token.interceptor';

export function provideCoreHttp(): EnvironmentProviders {
  return provideHttpClient(withInterceptors([authTokenInterceptor]));
}
