import type { Routes } from '@angular/router';
import { AppLayoutComponent } from '../shell/app-layout/app-layout.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
      { path: 'auth', loadChildren: () => import('../features/auth/auth.routes').then(module => module.AUTH_ROUTES) },
      { path: '**', redirectTo: 'auth/login' },
    ],
  },
];
