import type { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: 'login', title: 'Inicio de sesión | CasePilot', loadComponent: () => import('./pages/login/login.page').then(module => module.LoginPage) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
