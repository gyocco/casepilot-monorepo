import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthFacade } from './auth.facade';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  await auth.waitUntilReady();
  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  await auth.waitUntilReady();
  return auth.isAuthenticated() ? router.createUrlTree(['/profile']) : true;
};
