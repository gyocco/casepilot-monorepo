import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AppConfigStore } from '../config/app-config';
import { AuthFacade } from './auth.facade';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(AppConfigStore).config().apiBaseUrl;
  const targetsApi = req.url === apiBaseUrl || req.url.startsWith(`${apiBaseUrl}/`);
  if (!targetsApi) {
    return next(req);
  }
  const auth = inject(AuthFacade);
  return from(auth.getIdToken()).pipe(
    switchMap(token => {
      if (!token) return next(req);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};
