import type { Routes } from '@angular/router';
import { authGuard } from '../core/auth/auth.guards';
import { AppLayoutComponent } from '../shell/app-layout/app-layout.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      { path: 'auth', loadChildren: () => import('../features/auth/auth.routes').then(module => module.AUTH_ROUTES) },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadChildren: () => import('../features/profile/profile.routes').then(module => module.PROFILE_ROUTES),
      },
      { path: '**', redirectTo: 'auth/login' },
    ],
  },
];
