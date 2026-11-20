import type { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth/auth.guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Inicio de sesión | CasePilot',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then(module => module.LoginPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
